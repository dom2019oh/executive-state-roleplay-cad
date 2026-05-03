import { Hono } from 'hono'
import { db, now, genId } from '../../lib/firebase'
import { requireAuth, requireOfficer, requireClockedIn } from '../../middleware/auth'

const arrests = new Hono()
arrests.use('*', requireAuth, requireOfficer)

arrests.post('/', requireClockedIn, async (c) => {
  const body = await c.req.json()
  const officerId = c.get('officerId')
  const officer = c.get('officer')
  const ref = db.collection('arrests').doc()
  const ts = now()

  const totalFine = (body.charges as any[]).reduce(
    (sum: number, ch: any) => sum + ch.fine * (ch.count || 1),
    0
  )

  const arrest = {
    arrestNumber: genId('ARR'),
    civilianId: body.civilianId,
    arrestingOfficerId: officerId,
    department: officer.department,
    callId: body.callId ?? null,
    incidentId: body.incidentId ?? null,
    arrestDate: ts,
    location: body.location ?? '',
    charges: body.charges ?? [],
    totalFine,
    totalJailTime: body.totalJailTime ?? '',
    bookingNotes: body.bookingNotes ?? '',
    mugshot: body.mugshot ?? null,
    status: 'booked',
    createdAt: ts,
    updatedAt: ts,
  }

  await ref.set(arrest)
  return c.json({ id: ref.id, ...arrest }, 201)
})

arrests.get('/', async (c) => {
  const civilianId = c.req.query('civilianId')
  let q = db.collection('arrests').orderBy('createdAt', 'desc').limit(50) as FirebaseFirestore.Query
  if (civilianId) q = q.where('civilianId', '==', civilianId)

  const snap = await q.get()
  return c.json({ arrests: snap.docs.map((d) => ({ id: d.id, ...d.data() })) })
})

arrests.get('/:id', async (c) => {
  const doc = await db.collection('arrests').doc(c.req.param('id')).get()
  if (!doc.exists) return c.json({ error: 'Not found' }, 404)
  return c.json({ arrest: { id: doc.id, ...doc.data() } })
})

arrests.patch('/:id/status', requireClockedIn, async (c) => {
  const { status } = await c.req.json()
  const valid = ['booked', 'released', 'arraigned', 'convicted', 'dismissed']
  if (!valid.includes(status)) return c.json({ error: 'Invalid status' }, 400)

  await db.collection('arrests').doc(c.req.param('id')).update({ status, updatedAt: now() })
  return c.json({ ok: true })
})

export default arrests
