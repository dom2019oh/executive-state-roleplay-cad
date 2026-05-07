import { Hono } from 'hono'
import { db, now } from '../lib/firebase'
import { requireAuth } from '../middleware/auth'

const civilians = new Hono()
civilians.use('*', requireAuth)

civilians.post('/', async (c) => {
  const userId = c.get('userId')
  const user = c.get('user')

  if (user.civilianId) return c.json({ error: 'Civilian profile already exists' }, 400)

  const body = await c.req.json()
  const ref = db.collection('civilians').doc()

  const civilian = {
    userId,
    firstName: body.firstName,
    lastName: body.lastName,
    dateOfBirth: body.dateOfBirth,
    gender: body.gender,
    ethnicity: body.ethnicity || '',
    height: body.height || '',
    weight: body.weight || '',
    eyeColor: body.eyeColor || '',
    hairColor: body.hairColor || '',
    address: body.address || '',
    phone: body.phone || '',
    occupation: body.occupation || '',
    mugshot: null,
    driversLicense: {
      number: body.driversLicense?.number || '',
      class: body.driversLicense?.class || 'none',
      status: body.driversLicense?.status || 'valid',
      issuedAt: body.driversLicense?.issuedAt || now(),
      expiresAt: body.driversLicense?.expiresAt || now() + 365 * 24 * 60 * 60 * 1000,
    },
    weaponLicense: {
      status: 'none',
      issuedAt: null,
    },
    flags: [],
    notes: '',
    createdAt: now(),
    updatedAt: now(),
  }

  await ref.set(civilian)
  await db.collection('users').doc(userId).update({ civilianId: ref.id })

  return c.json({ id: ref.id, ...civilian }, 201)
})

civilians.get('/me', async (c) => {
  const user = c.get('user')
  if (!user.civilianId) return c.json({ civilian: null })

  const doc = await db.collection('civilians').doc(user.civilianId).get()
  if (!doc.exists) return c.json({ civilian: null })

  const vehiclesSnap = await db
    .collection('vehicles')
    .where('ownerId', '==', doc.id)
    .get()

  const warrants = await db
    .collection('warrants')
    .where('civilianId', '==', doc.id)
    .where('status', '==', 'active')
    .get()

  const citations = await db
    .collection('citations')
    .where('civilianId', '==', doc.id)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get()

  return c.json({
    civilian: { id: doc.id, ...doc.data() },
    vehicles: vehiclesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    activeWarrants: warrants.size,
    citations: citations.docs.map((d) => ({ id: d.id, ...d.data() })),
  })
})

civilians.get('/search', async (c) => {
  const q = c.req.query('q')?.trim()
  if (!q || q.length < 2) return c.json({ results: [] })

  const qLower = q.toLowerCase()

  const snap = await db
    .collection('civilians')
    .orderBy('lastName')
    .limit(100)
    .get()

  const results = snap.docs
    .filter((d) => {
      const data = d.data()
      const full = `${data.lastName} ${data.firstName}`.toLowerCase()
      return full.includes(qLower)
    })
    .slice(0, 8)
    .map((d) => ({ id: d.id, ...d.data() }))

  return c.json({ results })
})

civilians.get('/:id', async (c) => {
  const doc = await db.collection('civilians').doc(c.req.param('id')).get()
  if (!doc.exists) return c.json({ error: 'Not found' }, 404)

  const [vehicles, warrants, citations, arrests] = await Promise.all([
    db.collection('vehicles').where('ownerId', '==', doc.id).get(),
    db.collection('warrants').where('civilianId', '==', doc.id).get(),
    db.collection('citations').where('civilianId', '==', doc.id).orderBy('createdAt', 'desc').limit(50).get(),
    db.collection('arrests').where('civilianId', '==', doc.id).orderBy('createdAt', 'desc').limit(50).get(),
  ])

  return c.json({
    civilian: { id: doc.id, ...doc.data() },
    vehicles: vehicles.docs.map((d) => ({ id: d.id, ...d.data() })),
    warrants: warrants.docs.map((d) => ({ id: d.id, ...d.data() })),
    citations: citations.docs.map((d) => ({ id: d.id, ...d.data() })),
    arrests: arrests.docs.map((d) => ({ id: d.id, ...d.data() })),
  })
})

civilians.patch('/:id', async (c) => {
  const doc = await db.collection('civilians').doc(c.req.param('id')).get()
  if (!doc.exists) return c.json({ error: 'Not found' }, 404)

  const user = c.get('user')
  const data = doc.data()!
  const isOwner = data.userId === c.get('userId')
  const isOfficer = ['officer', 'dispatcher', 'admin'].includes(user.role)

  if (!isOwner && !isOfficer) return c.json({ error: 'Forbidden' }, 403)

  const body = await c.req.json()
  const ownerFields = ['address', 'phone', 'occupation', 'height', 'weight', 'hairColor', 'eyeColor', 'driversLicense']
  const officerFields = ['notes', 'flags', 'weaponLicense', 'mugshot', 'ethnicity']
  const allowed = isOwner ? [...ownerFields, ...(isOfficer ? officerFields : [])] : officerFields

  const update: Record<string, unknown> = { updatedAt: now() }
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  await doc.ref.update(update)
  return c.json({ ok: true })
})

export default civilians
