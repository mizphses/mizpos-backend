import Stripe from 'stripe'
import { Hono } from 'hono'
import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'

const payment = new Hono<{ Bindings: CloudflareBindings }>()

payment.post('/webhook', async (c) => {
  const stripe_secret = c.env.STRIPE_API_KEY
  const stripe_webhook_secret = c.env.STRIPE_WEBHOOK_SECRET
  const stripe = new Stripe(stripe_secret)
  const signature = c.req.header('stripe-signature')

  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })

  try {
    if (!signature) {
      return c.text('Error! Not Signed', 400)
    }
    const body = await c.req.text()
    const event = await stripe.webhooks.constructEventAsync(body, signature, stripe_webhook_secret)

    switch (event.type) {
      case 'checkout.session.completed': {
        await prisma.cart.update({
          where: {
            id: event.data.object.client_reference_id || '',
          },
          data: {
            stripeId: event.data.object.id,
          },
        })

        break
      }

      default:
        return c.text('Error! Not registered operation', 400)
    }
    return c.text('', 200)
  } catch (err) {
    const errorMessage = `⚠️ Webhook signature verification failed. ${err instanceof Error ? err.message : 'Internal server error'}`
    console.log(errorMessage)
    return c.text(errorMessage, 400)
  }
})

export default payment
