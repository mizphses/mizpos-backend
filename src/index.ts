import { Hono } from 'hono'
import auth from './routes/auth'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.route('/auth', auth)

export default app
