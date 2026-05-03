import { Hono } from 'hono'
import { FieldValue } from 'firebase-admin/firestore'
import { db, now, genId } from '../../lib/firebase'
import { requireAuth, requireOfficer, requireClockedIn } from '../../middleware/auth'

const warrants = new Hono()
warrants.use('*', requireAuth, requireOfficer)

warrants.post('/', requireClockedIn, async (c) => {
  const body = await c.req.json()
  const officerId = c.get('officerId')
  const officer = c.get('officer')
  const ref = db.collection('warrants').doc()
  const ts = now()

  const warrant = {
    warrantNumber: genId('WRT'),
    civilianId: body.civilianId,
    issuedBy: officerId,
    approvedBy: body.approvedBy ?? null,
    department: officer.department,
    type: body.type ?? 'arrest',
    reason: body.reason ?? '',
    charges: body.charges ?? [],
    status: 'active',
    issuedAt: ts,
    expiresAt: body.expiresAt ?? null,
    servedAt: null,
    servedBy: null,
    notes: body.notes ?? '',
  }

  await ref.set(warrant)

  await db.collection('civilians').doc(body.civilianId).update({
    flags: FieldValue.arrayUnion('wanted'),
    updatedAt: ts,
  })

  return c.json({ id: ref.id, ...warrant }, 201)
})

warrants.get('/', async (c) => {
  const civilianId = c.req.query('civilianId')
  const status = c.req.query('status') ?? 'active'
  let q = db.collection('warrants').where('status', '==', status).limit(100) as FirebaseFirestore.Query
  if (civilianId) q = q.where('civilianId', '==', civilianId)

  const snap = await q.get()
  return c.json({ warrants: snap.docs.map((d) => ({ id: d.id, ...d.data() })) })
})

warrants.patch('/:id/serve', requireClockedIn, async (c) => {
  const officerId = c.get('officerId')
  const ts = now()
  const warrantRef = db.collection('warrants').doc(c.req.param('id'))
  const doc = await warrantRef.get()
  if (!doc.exists) return c.json({ error: 'Not found' }, 404)

  await warrantRef.update({ status: 'served', servedAt: ts, servedBy: officerId })
  return c.json({ ok: true })
})

warrants.patch('/:id/recall', requireClockedIn, async (c) => {
  const warrantRef = db.collection('warrants').doc(c.req.param('id'))
  await warrantRef.update({ status: 'recalled' })
  return c.json({ ok: true })
})

export default warrants
