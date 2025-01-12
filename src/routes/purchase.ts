import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'
import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import Stripe from 'stripe'
const pay = new Hono<{ Bindings: CloudflareBindings }>()

pay.use('/point', (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  })
  return jwtMiddleware(c, next)
})

pay.post('/cart', async (c) => {
  const { items } = await c.req.json<{
    items: string[]
  }>()

  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })

  const itemsInCartUnq = await prisma.items.findMany({
    where: {
      id: {
        in: items,
      },
    },
  })

  const uniqueItems = new Set(items.map((item) => item))

  if (itemsInCartUnq.length !== uniqueItems.size) {
    return c.json({
      error: 'Invalid items',
    })
  }

  const itemsInCart = itemsInCartUnq.map((item) => ({
    ...item,
    count: items.filter((i) => i === item.id).length,
  }))

  const total = itemsInCart.reduce((acc, item) => {
    return acc + item.price * item.count
  }, 0)

  const cartId = await prisma.cart
    .create({
      data: {
        itemsList: JSON.stringify(itemsInCart),
        status: 'pending',
      },
    })
    .catch((e) => {
      console.error(e)
      return null
    })
  return c.json({
    cartId: cartId,
    total,
  })
})

pay.post('/checkout', async (c) => {
  const cartId = await c.req
    .json<{
      cartId: string
    }>()
    .then((data) => data.cartId)

  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })

  const cart = await prisma.cart.findFirst({
    where: {
      id: cartId,
    },
  })

  if (!cart) {
    return c.json({
      c: await prisma.cart.findMany(),
      error: 'Invalid cart',
    })
  }

  const items: {
    count: number
    id: string
    name: string
    price: number
    description?: string | null
    image?: string | null
  }[] = JSON.parse(cart.itemsList)

  const total = items.reduce((acc: number, item: { price: number; count: number }) => {
    return acc + item.price * item.count
  }, 0)

  if (cart.status === 'paid') {
    return c.json({
      error: 'Already checked out',
    })
  }

  // stripeでcheckout
  const stripe = new Stripe(c.env.STRIPE_API_KEY)
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items.map((items) => ({
      price_data: {
        currency: 'jpy',
        product_data: {
          name: items.name,
          images: [items.image ?? 'https://placehold.jp/150x150.png'],
        },
        unit_amount: items.price,
      },
      quantity: items.count,
    })),
    mode: 'payment',
    shipping_address_collection: {
      allowed_countries: ['JP'],
    },
    client_reference_id: cartId,
    success_url: `http://localhost:8787/pay/success/${cartId}`,
    cancel_url: `http://localhost:8787/pay/cancel/${cartId}`,
  })

  return c.json({
    sessionId: session.url,
    total,
  })
})

pay.get('/success/:cartId', async (c) => {
  const cartId = c.req.param('cartId')
  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })

  await new Promise((resolve) => setTimeout(resolve, 2000))

  const cart = await prisma.cart.findFirst({
    where: {
      id: cartId,
    },
  })

  if (!cart) {
    return c.json({
      error: 'Invalid cart',
    })
  }

  const items: {
    count: number
    id: string
    name: string
    price: number
    description?: string | null
    image?: string | null
  }[] = JSON.parse(cart.itemsList)

  const total = items.reduce((acc: number, item: { price: number; count: number }) => {
    return acc + item.price * item.count
  }, 0)

  // stripeで状況確認
  const stripe = new Stripe(c.env.STRIPE_API_KEY)
  const session = await stripe.checkout.sessions.retrieve(cart.stripeId || '')

  return c.json({
    total,
    items,
    status: session.status,
  })

  // {"total":10000,"items":[{"id":"cm5tq4p370000x40c3x0g0nmt","name":"タイトル１","price":10000,"description":"サンプル商品です","image":null,"visible":true,"createdAt":"2025-01-12T14:42:10.045Z","updatedAt":"2025-01-12T14:42:10.045Z","count":1}],"status":"complete"}
})

pay.get('/cancel/:cartId', async (c) => {
  return c.json({
    message: 'Canceled',
  })
})

export default pay
