import { Hono } from 'hono'
import { createHash, timingSafeEqual } from 'crypto'
import { db } from '../lib/firebase'
import { requireAuth } from '../middleware/auth'

const admin = new Hono()

const FOUNDER_ID = '924720491720237096'
const FOUNDER_PW_HASH = 'c390e51af68e43b102e66d6aa3f167d38546a3db253433653243bdb3dcba88f1'

function sha256(s: string) {
  return createHash('sha256').update(s).digest()
}

function requireFounder(c: any) {
  if (c.get('userId') !== FOUNDER_ID) return c.json({ error: 'Forbidden' }, 403)
  return null
}

async function requireFounderVerified(c: any) {
  const denied = requireFounder(c)
  if (denied) return denied
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  const session = await db.collection('sessions').doc(token!).get()
  if (!session.data()?.founderVerified) return c.json({ error: 'Founder verification required' }, 403)
  return null
}

admin.post('/founder-verify', requireAuth, async (c) => {
  const denied = requireFounder(c)
  if (denied) return denied

  const body = await c.req.json().catch(() => ({}))
  if (!body.password) return c.json({ error: 'Password required' }, 400)

  const inputHash = sha256(body.password)
  const storedHash = Buffer.from(FOUNDER_PW_HASH, 'hex')

  if (inputHash.length !== storedHash.length || !timingSafeEqual(inputHash, storedHash)) {
    return c.json({ error: 'Invalid password' }, 401)
  }

  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  await db.collection('sessions').doc(token!).update({ founderVerified: true })

  return c.json({ ok: true })
})

admin.get('/users', requireAuth, async (c) => {
  const denied = await requireFounderVerified(c)
  if (denied) return denied

  const snapshot = await db.collection('users').orderBy('lastLogin', 'desc').get()
  const users = snapshot.docs.map((doc) => {
    const d = doc.data()
    return {
      discordId: doc.id,
      discordUsername: d.discordUsername,
      discordDisplayName: d.discordDisplayName,
      discordAvatar: d.discordAvatar,
      role: d.role,
      lastLogin: d.lastLogin,
      createdAt: d.createdAt,
      banned: d.banned,
      guildMember: d.guildMember,
    }
  })

  return c.json({ users })
})

export default admin
