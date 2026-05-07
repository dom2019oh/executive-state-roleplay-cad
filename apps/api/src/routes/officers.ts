import { Hono } from 'hono'
import { db, now } from '../lib/firebase'
import { requireAuth, requireOfficer, requireClockedIn } from '../middleware/auth'

const officers = new Hono()
officers.use('*', requireAuth)

officers.post('/join', async (c) => {
  const userId = c.get('userId')
  const user = c.get('user')

  if (!user.civilianId) return c.json({ error: 'Create a civilian profile first' }, 400)
  if (user.officerId) return c.json({ error: 'Already in a department' }, 400)

  const { department, badgeNumber } = await c.req.json()
  if (!department || !badgeNumber) return c.json({ error: 'Missing department or badge number' }, 400)

  const validDepts = ['LSPD', 'SAST', 'SAFD', 'SAMS', 'DISPATCH']
  if (!validDepts.includes(department)) return c.json({ error: 'Invalid department' }, 400)
  if (!/^\d{5}$/.test(badgeNumber)) return c.json({ error: 'Badge number must be exactly 5 digits' }, 400)

  const existing = await db.collection('officers').where('badgeNumber', '==', badgeNumber).where('department', '==', department).get()
  if (!existing.empty) return c.json({ error: 'Badge number already in use for this department' }, 400)

  const civilianDoc = await db.collection('civilians').doc(user.civilianId).get()
  const civilian = civilianDoc.data()!

  const ref = db.collection('officers').doc()
  const officer = {
    userId,
    civilianId: user.civilianId,
    department,
    badgeNumber,
    callSign: null,
    rank: 'Recruit',
    clockedIn: false,
    clockedInAt: null,
    clockedOutAt: null,
    status: '10-7',
    statusLabel: 'Out of Service',
    currentCallId: null,
    suspended: false,
    suspendReason: null,
    createdAt: now(),
    updatedAt: now(),
  }

  await ref.set(officer)
  await db.collection('users').doc(userId).update({
    officerId: ref.id,
    role: department === 'DISPATCH' ? 'dispatcher' : 'officer',
  })

  return c.json({ id: ref.id, ...officer }, 201)
})

officers.post('/clock-in', requireOfficer, async (c) => {
  const officerId = c.get('officerId')
  const officer = c.get('officer')
  const userId = c.get('userId')

  if (officer.clockedIn) return c.json({ error: 'Already clocked in' }, 400)

  const civilianDoc = await db.collection('civilians').doc(officer.civilianId).get()
  const civilian = civilianDoc.data()!

  const ts = now()
  await db.collection('officers').doc(officerId).update({
    clockedIn: true,
    clockedInAt: ts,
    clockedOutAt: null,
    status: '10-41',
    statusLabel: 'Beginning Tour of Duty',
    updatedAt: ts,
  })

  await db.collection('active_units').doc(officerId).set({
    officerId,
    userId,
    department: officer.department,
    badgeNumber: officer.badgeNumber,
    callSign: officer.callSign,
    rank: officer.rank,
    fullName: `${civilian.firstName} ${civilian.lastName}`,
    status: '10-41',
    statusLabel: 'Beginning Tour of Duty',
    currentCallId: null,
    panicActive: false,
    location: null,
    clockedInAt: ts,
    lastUpdated: ts,
  })

  return c.json({ ok: true })
})

officers.post('/clock-out', requireOfficer, requireClockedIn, async (c) => {
  const officerId = c.get('officerId')
  const ts = now()

  await db.collection('officers').doc(officerId).update({
    clockedIn: false,
    clockedOutAt: ts,
    status: '10-42',
    statusLabel: 'Ending Tour of Duty',
    currentCallId: null,
    updatedAt: ts,
  })

  await db.collection('active_units').doc(officerId).delete()

  return c.json({ ok: true })
})

officers.patch('/status', requireOfficer, requireClockedIn, async (c) => {
  const officerId = c.get('officerId')
  const { status, statusLabel, location } = await c.req.json()
  const ts = now()

  if (status === '10-99' || status === '10-100') {
    await db.collection('active_units').doc(officerId).update({
      panicActive: true,
      status,
      statusLabel,
      lastUpdated: ts,
    })
  }

  await Promise.all([
    db.collection('officers').doc(officerId).update({ status, statusLabel, updatedAt: ts }),
    db.collection('active_units').doc(officerId).update({
      status,
      statusLabel,
      location: location ?? null,
      panicActive: status === '10-99' || status === '10-100',
      lastUpdated: ts,
    }),
  ])

  return c.json({ ok: true })
})

officers.get('/active', requireOfficer, async (c) => {
  const snap = await db.collection('active_units').get()
  return c.json({
    units: snap.docs.map((d) => ({ ...d.data() })),
  })
})

officers.get('/me', requireOfficer, async (c) => {
  const officerId = c.get('officerId')
  const officer = c.get('officer')
  return c.json({ officer: officerId ? { id: officerId, ...officer } : null })
})

officers.patch('/me', requireOfficer, async (c) => {
  const officerId = c.get('officerId')
  if (!officerId) return c.json({ error: 'No officer profile' }, 400)

  const body = await c.req.json()
  const update: Record<string, unknown> = { updatedAt: now() }

  if ('callSign' in body) update.callSign = body.callSign || null
  if ('loa' in body) update.loa = !!body.loa
  if ('loaReason' in body) update.loaReason = body.loaReason || null

  await db.collection('officers').doc(officerId).update(update)

  if ('callSign' in body || 'loa' in body) {
    const activeUnit = await db.collection('active_units').doc(officerId).get()
    if (activeUnit.exists) {
      await activeUnit.ref.update({
        ...(('callSign' in body) ? { callSign: update.callSign } : {}),
        ...(('loa' in body) ? { loa: update.loa } : {}),
        lastUpdated: now(),
      })
    }
  }

  return c.json({ ok: true })
})

export default officers
