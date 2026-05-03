import type { Context, Next } from 'hono'
import { db } from '../lib/firebase'

export async function requireAuth(c: Context, next: Next) {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  const sessionDoc = await db.collection('sessions').doc(token).get()
  if (!sessionDoc.exists) return c.json({ error: 'Invalid session' }, 401)

  const session = sessionDoc.data()!
  if (session.expiresAt < Date.now()) {
    await sessionDoc.ref.delete()
    return c.json({ error: 'Session expired' }, 401)
  }

  const userDoc = await db.collection('users').doc(session.userId).get()
  if (!userDoc.exists) return c.json({ error: 'User not found' }, 401)

  const user = userDoc.data()!
  if (!user.guildMember) return c.json({ error: 'Not a guild member' }, 403)
  if (user.banned) return c.json({ error: 'Account suspended' }, 403)

  c.set('userId', session.userId)
  c.set('user', user)
  await next()
}

export async function requireOfficer(c: Context, next: Next) {
  const user = c.get('user')
  if (!['officer', 'dispatcher', 'admin'].includes(user.role)) {
    return c.json({ error: 'Officer access required' }, 403)
  }
  if (!user.officerId) return c.json({ error: 'No officer profile found' }, 403)

  const officerDoc = await db.collection('officers').doc(user.officerId).get()
  if (!officerDoc.exists) return c.json({ error: 'Officer profile not found' }, 404)

  const officer = officerDoc.data()!
  if (officer.suspended) return c.json({ error: 'Officer suspended' }, 403)

  c.set('officerId', user.officerId)
  c.set('officer', officer)
  await next()
}

export async function requireClockedIn(c: Context, next: Next) {
  const officer = c.get('officer')
  if (!officer?.clockedIn) return c.json({ error: 'Must be clocked in to perform this action' }, 403)
  await next()
}

export async function requireDispatch(c: Context, next: Next) {
  const officer = c.get('officer')
  const user = c.get('user')
  if (user.role !== 'admin' && officer?.department !== 'DISPATCH') {
    return c.json({ error: 'Dispatch access required' }, 403)
  }
  await next()
}
