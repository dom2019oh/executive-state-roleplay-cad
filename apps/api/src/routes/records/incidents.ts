import { Hono } from 'hono'
import { db, now, genId } from '../../lib/firebase'
import { requireAuth, requireOfficer, requireClockedIn } from '../../middleware/auth'

const incidents = new Hono()
incidents.use('*', requireAuth, requireOfficer)

incidents.post('/', requireClockedIn, async (c) => {
  const body = await c.req.json()
  const officerId = c.get('officerId')
  const officer = c.get('officer')
  const ref = db.collection('incidents').doc()
  const ts = now()

  const incident = {
    incidentNumber: genId('INC'),
    callId: body.callId ?? null,
    title: body.title ?? '',
    type: body.type ?? 'other',
    description: body.description ?? '',
    location: body.location ?? '',
    incidentDate: ts,
    status: 'open',
    department: officer.department,
    createdBy: officerId,
    involvedOfficers: body.involvedOfficers ?? [officerId],
    involvedCivilians: body.involvedCivilians ?? [],
    involvedVehicles: body.involvedVehicles ?? [],
    attachments: [],
    createdAt: ts,
    updatedAt: ts,
  }

  await ref.set(incident)
  return c.json({ id: ref.id, ...incident }, 201)
})

incidents.get('/', async (c) => {
  const status = c.req.query('status')
  let q = db.collection('incidents').orderBy('createdAt', 'desc').limit(50) as FirebaseFirestore.Query
  if (status) q = q.where('status', '==', status)
  const snap = await q.get()
  return c.json({ incidents: snap.docs.map((d) => ({ id: d.id, ...d.data() })) })
})

incidents.get('/:id', async (c) => {
  const doc = await db.collection('incidents').doc(c.req.param('id')).get()
  if (!doc.exists) return c.json({ error: 'Not found' }, 404)
  return c.json({ incident: { id: doc.id, ...doc.data() } })
})

incidents.patch('/:id', requireClockedIn, async (c) => {
  const body = await c.req.json()
  const allowed = ['title', 'description', 'status', 'involvedOfficers', 'involvedCivilians', 'involvedVehicles']
  const update: Record<string, unknown> = { updatedAt: now() }
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }
  await db.collection('incidents').doc(c.req.param('id')).update(update)
  return c.json({ ok: true })
})

export default incidents
