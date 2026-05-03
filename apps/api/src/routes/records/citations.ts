import { Hono } from 'hono'
import { db, now, genId } from '../../lib/firebase'
import { requireAuth, requireOfficer, requireClockedIn } from '../../middleware/auth'

const citations = new Hono()
citations.use('*', requireAuth, requireOfficer)

citations.post('/', requireClockedIn, async (c) => {
  const body = await c.req.json()
  const officerId = c.get('officerId')
  const officer = c.get('officer')
  const ref = db.collection('citations').doc()
  const ts = now()

  const violations = body.violations ?? []
  const totalFine = violations.reduce((s: number, v: any) => s + (v.fine || 0), 0)
  const totalPoints = violations.reduce((s: number, v: any) => s + (v.points || 0), 0)

  const citation = {
    citationNumber: genId('CIT'),
    civilianId: body.civilianId,
    vehicleId: body.vehicleId ?? null,
    officerId,
    department: officer.department,
    callId: body.callId ?? null,
    incidentId: body.incidentId ?? null,
    type: body.type ?? 'traffic',
    date: ts,
    location: body.location ?? '',
    violations,
    totalFine,
    totalPoints,
    status: 'unpaid',
    notes: body.notes ?? '',
    createdAt: ts,
  }

  await ref.set(citation)
  return c.json({ id: ref.id, ...citation }, 201)
})

citations.get('/', async (c) => {
  const civilianId = c.req.query('civilianId')
  let q = db.collection('citations').orderBy('createdAt', 'desc').limit(50) as FirebaseFirestore.Query
  if (civilianId) q = q.where('civilianId', '==', civilianId)

  const snap = await q.get()
  return c.json({ citations: snap.docs.map((d) => ({ id: d.id, ...d.data() })) })
})

citations.patch('/:id/status', requireClockedIn, async (c) => {
  const { status } = await c.req.json()
  await db.collection('citations').doc(c.req.param('id')).update({ status })
  return c.json({ ok: true })
})

export default citations
