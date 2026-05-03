import { Hono } from 'hono'
import { db, now } from '../lib/firebase'
import { requireAuth, requireOfficer } from '../middleware/auth'

const vehicles = new Hono()
vehicles.use('*', requireAuth)

vehicles.post('/', async (c) => {
  const user = c.get('user')
  if (!user.civilianId) return c.json({ error: 'Civilian profile required' }, 400)

  const body = await c.req.json()
  const ref = db.collection('vehicles').doc()
  const ts = now()

  const vehicle = {
    ownerId: user.civilianId,
    plate: (body.plate as string).toUpperCase().trim(),
    vin: body.vin ?? '',
    make: body.make ?? '',
    model: body.model ?? '',
    year: body.year ?? new Date().getFullYear(),
    color: body.color ?? '',
    secondaryColor: body.secondaryColor ?? null,
    registrationStatus: 'valid',
    registrationExpiry: body.registrationExpiry ?? now() + 365 * 24 * 60 * 60 * 1000,
    insurance: {
      status: body.insurance?.status ?? 'valid',
      provider: body.insurance?.provider ?? null,
      expiresAt: body.insurance?.expiresAt ?? null,
    },
    flags: [],
    notes: '',
    createdAt: ts,
    updatedAt: ts,
  }

  await ref.set(vehicle)
  return c.json({ id: ref.id, ...vehicle }, 201)
})

vehicles.get('/search', requireOfficer, async (c) => {
  const plate = c.req.query('plate')?.toUpperCase().trim()
  if (!plate) return c.json({ results: [] })

  const snap = await db.collection('vehicles').where('plate', '==', plate).limit(5).get()
  const results = await Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data()
      const ownerDoc = await db.collection('civilians').doc(data.ownerId).get()
      return {
        id: d.id,
        ...data,
        owner: ownerDoc.exists ? { id: ownerDoc.id, ...ownerDoc.data() } : null,
      }
    })
  )

  return c.json({ results })
})

vehicles.get('/:id', requireOfficer, async (c) => {
  const doc = await db.collection('vehicles').doc(c.req.param('id')).get()
  if (!doc.exists) return c.json({ error: 'Not found' }, 404)
  return c.json({ vehicle: { id: doc.id, ...doc.data() } })
})

vehicles.patch('/:id', async (c) => {
  const doc = await db.collection('vehicles').doc(c.req.param('id')).get()
  if (!doc.exists) return c.json({ error: 'Not found' }, 404)

  const user = c.get('user')
  const data = doc.data()!
  const isOwner = data.ownerId === user.civilianId
  const isOfficer = ['officer', 'dispatcher', 'admin'].includes(user.role)

  if (!isOwner && !isOfficer) return c.json({ error: 'Forbidden' }, 403)

  const body = await c.req.json()
  const allowed = isOfficer
    ? ['registrationStatus', 'flags', 'notes', 'insurance']
    : ['color', 'secondaryColor', 'insurance']

  const update: Record<string, unknown> = { updatedAt: now() }
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  await doc.ref.update(update)
  return c.json({ ok: true })
})

export default vehicles
