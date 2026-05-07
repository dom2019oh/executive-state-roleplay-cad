import { Hono } from 'hono'
import { db, now } from '../lib/firebase'
import { exchangeCode, getDiscordUser, getGuildMember, refreshDiscordToken } from '../lib/discord'
import { randomBytes } from 'crypto'

const auth = new Hono()

const REDIRECT_URI = `${process.env.API_URL}/auth/discord/callback`
const SESSION_TTL = 365 * 24 * 60 * 60 * 1000 // 1 year
const IS_DEV = !process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY === 'PLACEHOLDER'

auth.get('/dev-login', async (c) => {
  if (!IS_DEV) return c.json({ error: 'Not available in production' }, 403)
  return c.redirect(`${process.env.WEB_URL}/auth/callback?token=dev-token`)
})

auth.get('/discord', (c) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email guilds.members.read',
  })
  return c.redirect(`https://discord.com/api/oauth2/authorize?${params}`)
})

auth.get('/discord/callback', async (c) => {
  const code = c.req.query('code')
  const error = c.req.query('error')

  if (error || !code) {
    return c.redirect(`${process.env.WEB_URL}/login?error=access_denied`)
  }

  try {
    const tokens = await exchangeCode(code, REDIRECT_URI)
    const discordUser = await getDiscordUser(tokens.access_token)
    const member = await getGuildMember(tokens.access_token, process.env.DISCORD_GUILD_ID!)

    const userRef = db.collection('users').doc(discordUser.id)
    const existing = await userRef.get()

    const userData = {
      discordId: discordUser.id,
      discordUsername: discordUser.username,
      discordDisplayName: discordUser.global_name || discordUser.username,
      discordAvatar: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null,
      discordBanner: discordUser.banner
        ? `https://cdn.discordapp.com/banners/${discordUser.id}/${discordUser.banner}.png`
        : null,
      discordAccentColor: discordUser.accent_color ?? null,
      discordEmail: discordUser.email ?? null,
      discordNitro: discordUser.premium_type ?? 0,
      discordBadges: discordUser.public_flags ?? 0,
      guildMember: !!member,
      guildRoles: member?.roles ?? [],
      guildNickname: member?.nick ?? null,
      guildAvatar: member?.avatar
        ? `https://cdn.discordapp.com/guilds/${process.env.DISCORD_GUILD_ID}/users/${discordUser.id}/avatars/${member.avatar}.png`
        : null,
      guildJoinedAt: member?.joined_at ?? null,
      guildBoostingSince: member?.premium_since ?? null,
      lastLogin: now(),
    }

    if (!existing.exists) {
      await userRef.set({
        ...userData,
        role: 'civilian',
        civilianId: null,
        officerId: null,
        banned: false,
        banReason: null,
        createdAt: now(),
      })
    } else {
      await userRef.update(userData)
    }

    if (!member) {
      return c.redirect(`${process.env.WEB_URL}/login?error=not_in_guild`)
    }

    const sessionToken = randomBytes(32).toString('hex')
    await db.collection('sessions').doc(sessionToken).set({
      userId: discordUser.id,
      createdAt: now(),
      expiresAt: now() + SESSION_TTL,
      discordAccessToken: tokens.access_token,
      discordRefreshToken: tokens.refresh_token,
      discordTokenExpiry: now() + (tokens.expires_in * 1000),
    })

    return c.redirect(`${process.env.WEB_URL}/auth/callback?token=${sessionToken}`)
  } catch (err) {
    console.error('Auth error:', err)
    return c.redirect(`${process.env.WEB_URL}/login?error=auth_failed`)
  }
})

auth.post('/logout', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (token) await db.collection('sessions').doc(token).delete()
  return c.json({ ok: true })
})

auth.get('/me', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return c.json({ user: null })

  const sessionDoc = await db.collection('sessions').doc(token).get()
  if (!sessionDoc.exists) return c.json({ user: null })

  const session = sessionDoc.data()!
  if (session.expiresAt < Date.now()) {
    await sessionDoc.ref.delete()
    return c.json({ user: null })
  }

  // Re-verify guild membership if Discord token has expired — refresh it silently
  if (session.discordTokenExpiry && session.discordTokenExpiry < Date.now() && session.discordRefreshToken) {
    try {
      const newTokens = await refreshDiscordToken(session.discordRefreshToken)
      const member = await getGuildMember(newTokens.access_token, process.env.DISCORD_GUILD_ID!)

      // Update session with new tokens
      await sessionDoc.ref.update({
        discordAccessToken: newTokens.access_token,
        discordRefreshToken: newTokens.refresh_token,
        discordTokenExpiry: Date.now() + (newTokens.expires_in * 1000),
      })

      // Update guild membership status on user
      await db.collection('users').doc(session.userId).update({
        guildMember: !!member,
        guildRoles: member?.roles ?? [],
        guildNickname: member?.nick ?? null,
        guildBoostingSince: member?.premium_since ?? null,
      })

      // If they left the guild, invalidate the session
      if (!member) {
        await sessionDoc.ref.delete()
        return c.json({ user: null })
      }
    } catch {
      // Token refresh failed — let the existing session continue until expiry
    }
  }

  const userDoc = await db.collection('users').doc(session.userId).get()
  if (!userDoc.exists) return c.json({ user: null })

  const user = userDoc.data()!
  if (!user.guildMember) return c.json({ user: null })

  return c.json({ user: { id: userDoc.id, ...user } })
})

export default auth
