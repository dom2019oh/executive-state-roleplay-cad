import { Hono } from 'hono'
import { db } from '../lib/firebase'
import { requireAuth, requireOfficer } from '../middleware/auth'

const search = new Hono()
search.use('*', requireAuth, requireOfficer)

search.get('/', async (c) => {
  const q = c.req.query('q')?.trim() ?? ''
  const type = c.req.query('type') ?? 'all'

  if (q.length < 2) return c.json({ civilians: [], vehicles: [] })

  const results: { civilians: any[]; vehicles: any[] } = { civilians: [], vehicles: [] }

  if (type === 'all' || type === 'person') {
    const snap = await db.collection('civilians').orderBy('lastName').limit(200).get()
    const qLower = q.toLowerCase()
    results.civilians = snap.docs
      .filter((d) => {
        const data = d.data()
        const full = `${data.firstName} ${data.lastName}`.toLowerCase()
        const rev = `${data.lastName} ${data.firstName}`.toLowerCase()
        return full.includes(qLower) || rev.includes(qLower)
      })
      .slice(0, 8)
      .map((d) => ({ id: d.id, ...d.data() }))
  }

  if (type === 'all' || type === 'vehicle') {
    const plateLookup = await db
      .collection('vehicles')
      .where('plate', '>=', q.toUpperCase())
      .where('plate', '<=', q.toUpperCase() + '')
      .limit(8)
      .get()

    results.vehicles = await Promise.all(
      plateLookup.docs.map(async (d) => {
        const data = d.data()
        const ownerDoc = await db.collection('civilians').doc(data.ownerId).get()
        return {
          id: d.id,
          ...data,
          owner: ownerDoc.exists ? { id: ownerDoc.id, ...ownerDoc.data() } : null,
        }
      })
    )
  }

  return c.json(results)
})

export default search
