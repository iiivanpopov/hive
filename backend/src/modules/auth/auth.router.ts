import { describeRoute, resolver } from 'hono-openapi'
import { setCookie } from 'hono/cookie'
import { cookiesConfig } from '@/config/cookies.config'
import { factory } from '@/lib/factory'
import { validator } from '@/middleware'
import { register } from './auth.service'
import { RegisterBodySchema, RegisterResponseSchema } from './schema/register.schema'

export const authRouter = factory.createApp()
  .post(
    '/register',
    describeRoute({
      summary: 'Register a new user',
      description: 'Create a new user account and return a session token.',
      responses: {
        200: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: resolver(RegisterResponseSchema),
            },
          },
        },
      },
    }),
    validator('json', RegisterBodySchema),
    async (c) => {
      const body = c.req.valid('json')

      const sessionToken = await register(body)

      setCookie(c, cookiesConfig.sessionToken, sessionToken, {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
      })

      return c.json({ sessionToken }, 200)
    },
  )
