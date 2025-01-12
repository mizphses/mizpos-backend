import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'
import { Hono } from 'hono'
import { jwt } from 'hono/jwt'

const manage = new Hono<{ Bindings: CloudflareBindings }>()

manage.use('/*', (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  })
  return jwtMiddleware(c, next)
})

manage.get('/carts', async (c) => {
  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })

  const items = await prisma.cart.findMany()

  return c.json({
    items,
  })
})

manage.get('/items', async (c) => {
  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })

  const items = await prisma.items.findMany()

  return c.json({
    items,
  })
})

manage.post('/items', async (c) => {
  const data = await c.req.json<{
    name: string
    price: number
    description?: string
    image?: string
  }>()
  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })

  const item = await prisma.items.create({
    data: data,
  })

  return c.json({
    item,
  })
})

manage.put('/items/:id', async (c) => {
  const id = c.req.param('id')
  const data = await c.req.json<{
    name?: string
    price?: number
    description?: string
    image?: string
  }>()

  const adapter = new PrismaD1(c.env.DB)
  const prisma = new PrismaClient({ adapter })

  const item = await prisma.items.update({
    where: {
      id,
    },
    data: {
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      ...data,
    },
  })

  return c.json({
    item,
  })
})

export default manage
