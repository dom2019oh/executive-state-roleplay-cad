import { Hono } from 'hono'
import { db, now, genId } from '../../lib/firebase'
import { requireAuth, requireOfficer, requireClockedIn } from '../../middleware/auth'

const bolos = new Hono()
bolos.use('*', requireAuth, requireOfficer)

bolos.post('/', requireClockedIn, async (c) => {
  const body = await c.req.json()
  const officerId = c.get('officerId')
  const officer = c.get('officer')
  const ref = db.collection('bolos').doc()
  const ts = now()

  const bolo = {
    boloNumber: genId('BOLO'),
    type: body.type ?? 'person',
    civilianId: body.civilianId ?? null,
    vehicleId: body.vehicleId ?? null,
    description: body.description ?? '',
    reason: body.reason ?? '',
    lastKnownLocation: body.lastKnownLocation ?? '',
    issuedBy: officerId,
    department: officer.department,
    priority: body.priority ?? 'medium',
    status: 'active',
    issuedAt: ts,
    expiresAt: body.expiresAt ?? null,
    resolvedAt: null,
    resolvedBy: null,
    notes: body.notes ?? '',
  }

  await ref.set(bolo)
  return c.json({ id: ref.id, ...bolo }, 201)
})

bolos.get('/', async (c) => {
  const status = c.req.query('status') ?? 'active'
  const snap = await db.collection('bolos').where('status', '==', status).limit(100).get()
  return c.json({ bolos: snap.docs.map((d) => ({ id: d.id, ...d.data() })) })
})

bolos.patch('/:id/resolve', requireClockedIn, async (c) => {
  const officerId = c.get('officerId')
  const ts = now()
  await db.collection('bolos').doc(c.req.param('id')).update({
    status: 'resolved',
    resolvedAt: ts,
    resolvedBy: officerId,
  })
  return c.json({ ok: true })
})

export default bolos
