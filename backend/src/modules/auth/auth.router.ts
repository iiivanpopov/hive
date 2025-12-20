import { describeRoute, resolver } from 'hono-openapi'
import { setCookie } from 'hono/cookie'
import { cookiesConfig } from '@/config/cookies.config'
import { factory } from '@/lib/factory'
import { validator } from '@/middleware'
import { confirmEmail, register } from './auth.service'
import { ConfirmParamsSchema, RegisterBodySchema, RegisterResponseSchema } from './schema'

export const authRouter = factory.createApp()
  .basePath('/auth')
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
