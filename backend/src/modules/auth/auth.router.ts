import { describeRoute } from 'hono-openapi'
import { setCookie } from 'hono/cookie'
import { authConfig } from '@/config'
import { factory } from '@/lib/factory'
import { validator } from '@/middleware'
import { confirmEmail, register } from './auth.service'
import { ConfirmParamsSchema, RegisterBodySchema } from './schema'

export const authRouter = factory.createApp()
  .basePath('/auth')
  .post(
    '/register',
    describeRoute({
      summary: 'Register a new user',
      description: 'Create a new user account and return a session token.',
      responses: {
        204: {
          description: 'User registered successfully',
        },
      },
    }),
    validator('json', RegisterBodySchema),
    async (c) => {
      const body = c.req.valid('json')

      const sessionToken = await register(body, c.req.header('User-Agent'))

      setCookie(c, authConfig.sessionTokenName, sessionToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: authConfig.sessionTokenTTL,
      })

      return c.body(null, 204)
    },
  )
  .post(
    '/confirm/:token',
    describeRoute({
      summary: 'Confirm user account',
      description: 'Confirm a user account using the provided confirmation token.',
      responses: {
        204: {
          description: 'Account confirmed successfully',
        },
      },
    }),
    validator('param', ConfirmParamsSchema),
    async (c) => {
      const { token } = c.req.valid('param')

      await confirmEmail(token)

      return c.body(null, 204)
    },
  )
