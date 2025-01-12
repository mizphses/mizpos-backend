import { Hono } from 'hono'
import auth from './routes/auth'
import pay from './routes/purchase'
import manage from './routes/manage'
import payment from './routes/paymentWebhook'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.route('/auth', auth)
app.route('/pay', pay)
app.route('/admin', manage)
app.route('/stripe', payment)

export default app
