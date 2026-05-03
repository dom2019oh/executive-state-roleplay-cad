import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import auth from './routes/auth'
import civilians from './routes/civilians'
import officers from './routes/officers'
import calls from './routes/calls'
import vehicles from './routes/vehicles'
import search from './routes/search'
import penalCodes from './routes/penal-codes'
import arrests from './routes/records/arrests'
import citations from './routes/records/citations'
import warrants from './routes/records/warrants'
import bolos from './routes/records/bolos'
import incidents from './routes/records/incidents'

const app = new Hono()

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: process.env.WEB_URL ?? 'http://localhost:3000',
    credentials: true,
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })
)

app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }))

app.route('/auth', auth)
app.route('/civilians', civilians)
app.route('/officers', officers)
app.route('/calls', calls)
app.route('/vehicles', vehicles)
app.route('/search', search)
app.route('/penal-codes', penalCodes)
app.route('/records/arrests', arrests)
app.route('/records/citations', citations)
app.route('/records/warrants', warrants)
app.route('/records/bolos', bolos)
app.route('/records/incidents', incidents)

app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

const PORT = Number(process.env.PORT ?? 3001)
console.log(`API running on http://localhost:${PORT}`)

export default {
  port: PORT,
  fetch: app.fetch,
}
