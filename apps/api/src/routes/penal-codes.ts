import { Hono } from 'hono'
import { db } from '../lib/firebase'
import { requireAuth } from '../middleware/auth'

const penalCodes = new Hono()
penalCodes.use('*', requireAuth)

penalCodes.get('/', async (c) => {
  const category = c.req.query('category')
  const severity = c.req.query('severity')
  const q = c.req.query('q')?.toLowerCase()

  let query = db.collection('penal_codes').where('searchable', '==', true) as FirebaseFirestore.Query

  if (category) query = query.where('category', '==', category)
  if (severity) query = query.where('severity', '==', severity)

  const snap = await query.orderBy('code').limit(200).get()
  let results = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  if (q) {
    results = results.filter((r: any) =>
      r.code.toLowerCase().includes(q) || r.title.toLowerCase().includes(q)
    )
  }

  return c.json({ penalCodes: results.slice(0, 50) })
})

penalCodes.get('/:id', async (c) => {
  const doc = await db.collection('penal_codes').doc(c.req.param('id')).get()
  if (!doc.exists) return c.json({ error: 'Not found' }, 404)
  return c.json({ penalCode: { id: doc.id, ...doc.data() } })
})

export default penalCodes
