const DISCORD_API = 'https://discord.com/api/v10'

export async function getDiscordUser(accessToken: string) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Failed to fetch Discord user')
  return res.json() as Promise<{
    id: string
    username: string
    global_name: string | null
    avatar: string | null
    banner: string | null
    accent_color: number | null
    email?: string
    premium_type?: number // 0=None, 1=Classic, 2=Nitro, 3=Basic
    public_flags?: number // badge bitfield
  }>
}

export async function getGuildMember(accessToken: string, guildId: string) {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds/${guildId}/member`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (res.status === 404) return null
  if (!res.ok) return null
  return res.json() as Promise<{
    roles: string[]
    nick: string | null
    avatar: string | null
    joined_at: string
    premium_since: string | null
    communication_disabled_until: string | null
  }>
}

export async function refreshDiscordToken(refreshToken: string) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    client_secret: process.env.DISCORD_CLIENT_SECRET!,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })
  if (!res.ok) throw new Error('Discord token refresh failed')
  return res.json() as Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
  }>
}

export async function exchangeCode(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID!,
    client_secret: process.env.DISCORD_CLIENT_SECRET!,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  })
  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Discord token exchange failed: ${err}`)
  }
  return res.json() as Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
    token_type: string
    scope: string
  }>
}
