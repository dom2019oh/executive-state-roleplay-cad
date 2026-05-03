import { Hono } from 'hono'
import { db, now } from '../lib/firebase'
import { exchangeCode, getDiscordUser, getGuildMember } from '../lib/discord'
import { randomBytes } from 'crypto'

const auth = new Hono()

const REDIRECT_URI = `${process.env.API_URL}/auth/discord/callback`
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

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
      guildMember: !!member,
      guildRoles: member?.roles ?? [],
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
  if (!sessionDoc.exists || sessionDoc.data()!.expiresAt < Date.now()) {
    return c.json({ user: null })
  }

  const userDoc = await db.collection('users').doc(sessionDoc.data()!.userId).get()
  if (!userDoc.exists) return c.json({ user: null })

  return c.json({ user: { id: userDoc.id, ...userDoc.data() } })
})

export default auth
