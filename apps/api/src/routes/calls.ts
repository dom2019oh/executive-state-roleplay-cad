import { Hono } from 'hono'
import { db, now, genId } from '../lib/firebase'
import { requireAuth, requireOfficer, requireClockedIn, requireDispatch } from '../middleware/auth'

const calls = new Hono()
calls.use('*', requireAuth)

calls.get('/', requireOfficer, async (c) => {
  const status = c.req.query('status')
  let query = db.collection('calls').orderBy('createdAt', 'desc').limit(100) as FirebaseFirestore.Query

  if (status) query = query.where('status', '==', status)

  const snap = await query.get()
  return c.json({ calls: snap.docs.map((d) => ({ id: d.id, ...d.data() })) })
})

calls.post('/', requireOfficer, requireClockedIn, async (c) => {
  const body = await c.req.json()
  const officer = c.get('officer')
  const officerId = c.get('officerId')
  const ref = db.collection('calls').doc()
  const ts = now()

  const call = {
    callNumber: genId('CAD'),
    origin: body.origin ?? 'dispatch',
    code: body.code ?? '',
    codeLabel: body.codeLabel ?? '',
    description: body.description ?? '',
    location: body.location ?? '',
    priority: body.priority ?? 2,
    status: 'pending',
    reportedBy: body.reportedBy ?? officerId,
    reporterName: body.reporterName ?? null,
    dispatcherId: officer.department === 'DISPATCH' ? officerId : null,
    assignedUnits: [],
    departmentsInvolved: [officer.department],
    notes: body.notes ?? '',
    createdAt: ts,
    updatedAt: ts,
    closedAt: null,
  }

  await ref.set(call)
  await ref.collection('logs').add({
    officerId,
    action: 'call_created',
    detail: `Call created by badge #${officer.badgeNumber}`,
    timestamp: ts,
  })

  return c.json({ id: ref.id, ...call }, 201)
})

calls.post('/911', requireAuth, async (c) => {
  const body = await c.req.json()
  const userId = c.get('userId')
  const ref = db.collection('calls').doc()
  const ts = now()

  const call = {
    callNumber: genId('CAD'),
    origin: '911_command',
    code: body.code ?? '10-0',
    codeLabel: body.codeLabel ?? 'Emergency',
    description: body.description ?? '',
    location: body.location ?? 'Unknown',
    priority: 1,
    status: 'pending',
    reportedBy: userId,
    reporterName: body.callerName ?? null,
    dispatcherId: null,
    assignedUnits: [],
    departmentsInvolved: [],
    notes: '',
    createdAt: ts,
    updatedAt: ts,
    closedAt: null,
  }

  await ref.set(call)
  await ref.collection('logs').add({
    officerId: null,
    action: 'call_created',
    detail: `911 call submitted by civilian`,
    timestamp: ts,
  })

  return c.json({ id: ref.id, ...call }, 201)
})

calls.patch('/:id/assign', requireOfficer, requireClockedIn, requireDispatch, async (c) => {
  const { officerIds } = await c.req.json()
  const callRef = db.collection('calls').doc(c.req.param('id'))
  const callDoc = await callRef.get()
  if (!callDoc.exists) return c.json({ error: 'Call not found' }, 404)

  const ts = now()
  await callRef.update({
    assignedUnits: officerIds,
    status: officerIds.length > 0 ? 'active' : 'pending',
    updatedAt: ts,
  })

  for (const officerId of officerIds) {
    const unitRef = db.collection('active_units').doc(officerId)
    await unitRef.update({ currentCallId: callRef.id, lastUpdated: ts })
    await db.collection('officers').doc(officerId).update({ currentCallId: callRef.id, updatedAt: ts })
  }

  await callRef.collection('logs').add({
    officerId: c.get('officerId'),
    action: 'units_assigned',
    detail: `Units assigned: ${officerIds.join(', ')}`,
    timestamp: ts,
  })

  return c.json({ ok: true })
})

calls.patch('/:id/status', requireOfficer, requireClockedIn, async (c) => {
  const { status, notes } = await c.req.json()
  const callRef = db.collection('calls').doc(c.req.param('id'))
  const callDoc = await callRef.get()
  if (!callDoc.exists) return c.json({ error: 'Call not found' }, 404)

  const ts = now()
  const update: Record<string, unknown> = { status, updatedAt: ts }
  if (notes) update.notes = notes
  if (status === 'closed') update.closedAt = ts

  await callRef.update(update)
  await callRef.collection('logs').add({
    officerId: c.get('officerId'),
    action: 'status_changed',
    detail: `Status changed to ${status}`,
    timestamp: ts,
  })

  return c.json({ ok: true })
})

calls.get('/:id', requireOfficer, async (c) => {
  const callDoc = await db.collection('calls').doc(c.req.param('id')).get()
  if (!callDoc.exists) return c.json({ error: 'Not found' }, 404)

  const logsSnap = await callDoc.ref.collection('logs').orderBy('timestamp', 'desc').limit(50).get()

  return c.json({
    call: { id: callDoc.id, ...callDoc.data() },
    logs: logsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  })
})

export default calls
