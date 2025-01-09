import { googleAuth } from '@hono/oauth-providers/google'
import { githubAuth } from '@hono/oauth-providers/github'
import { createToken } from '../lib/jwt'
import { Hono } from 'hono'
import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

const auth = new Hono<{ Bindings: CloudflareBindings }>()

auth.get(
  '/google',
  googleAuth({
    scope: ['openid', 'email', 'profile'],
  }),
  async (c) => {
    const user = c.get('user-google')
    const adapter = new PrismaD1(c.env.DB)
    const prisma = new PrismaClient({ adapter })

    let sysuser = null

    if ((await prisma.googleOauth.findUnique({ where: { id: user?.id } })) !== null) {
      const g = await prisma.googleOauth
        .findUnique({
          where: { id: user?.id },
        })
        .then(
          (r) => {
            return r?.userId
          },
          (e) => {
            console.error(e)
            return null
          },
        )

      sysuser = await prisma.user.findUniqueOrThrow({
        where: { id: g || '' },
      })
    } else {
      sysuser = await prisma.user.create({
        data: {
          name: user?.name || '',
          email: user?.email || '',
        },
      })

      await prisma.googleOauth.create({
        data: {
          id: user?.id,
          email: user?.email || '',
          userId: sysuser.id,
        },
      })
    }
    try {
      const jwt = await createToken(
        {
          uid: sysuser?.id || '',
          jti: createId(),
        },
        c.env.JWT_SECRET,
      )
      return c.json({ jwt })
    } catch (e) {
      console.error(e)
      return c.json({ error: 'Something Wrong' }, 500)
    }
  },
)

auth.get(
  '/github',
  githubAuth({
    oauthApp: true,
    scope: ['read:user', 'user:email'],
  }),
  async (c) => {
    const user = c.get('user-github')
    const adapter = new PrismaD1(c.env.DB)
    const prisma = new PrismaClient({ adapter })
    try {
      let sysuser = null
      if ((await prisma.gitHubOauth.findUnique({ where: { id: user?.id } })) !== null) {
        const g = await prisma.gitHubOauth
          .findUnique({
            where: { id: user?.id },
          })
          .then(
            (r) => {
              return r?.userId
            },
            (e) => {
              console.error(e)
              return null
            },
          )
        sysuser = await prisma.user.findUniqueOrThrow({
          where: { id: g || '' },
        })
      } else {
        sysuser = await prisma.user.create({
          data: {
            name: user?.name || '',
            email: user?.email || '',
          },
        })
        await prisma.gitHubOauth.create({
          data: {
            id: user?.id || 0,
            email: user?.email || '',
            userId: sysuser.id,
          },
        })
      }
      const jwt = await createToken(
        {
          uid: sysuser?.id || '',
          jti: createId(),
        },
        c.env.JWT_SECRET,
      )
      return c.json({ jwt })
    } catch (e) {
      console.error(e)
      return c.json({ error: 'Something Wrong' }, 500)
    }
  },
)

export default auth
