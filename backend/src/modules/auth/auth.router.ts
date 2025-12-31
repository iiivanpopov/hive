import type { GoogleUser } from '@hono/oauth-providers/google'
import type { AuthService } from './auth.service'
import { googleAuth } from '@hono/oauth-providers/google'
import { describeRoute } from 'hono-openapi'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { authConfig } from '@/config'
import { factory } from '@/lib/factory'
import { validator } from '@/middleware'
import { ConfirmParamsSchema } from './schema/confirm.schema'
import { LoginBodySchema } from './schema/login.schema'
import { RegisterBodySchema } from './schema/register.schema'
import { RequestResetSchema } from './schema/request-reset.schema'
import { ResetPasswordBodySchema, ResetPasswordParamsSchema } from './schema/reset-password.schema'

export class AuthRouter {
  basePath = '/auth'

  constructor(
    private readonly authService: AuthService,
  ) {}

  init() {
    const app = factory
      .createApp()
      .basePath(this.basePath)
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

          const sessionToken = await this.authService.register(body, c.req.header('User-Agent'))

          setCookie(c, authConfig.sessionTokenCookie, sessionToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: authConfig.sessionTokenTtl,
          })

          return c.body(null, 204)
        },
      )
      .post(
        '/login',
        describeRoute({
          summary: 'Login into an account',
          description: 'Authenticate a user and return a session token.',
          responses: {
            204: {
              description: 'User logged in successfully',
            },
          },
        }),
        validator('json', LoginBodySchema),
        async (c) => {
          const body = c.req.valid('json')

          const sessionToken = await this.authService.login(body, c.req.header('User-Agent'))

          setCookie(c, authConfig.sessionTokenCookie, sessionToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: authConfig.sessionTokenTtl,
          })

          return c.body(null, 204)
        },
      )
      .post(
        '/logout',
        describeRoute({
          summary: 'Logout from current session',
          description: 'Invalidate the current user session token.',
          responses: {
            204: {
              description: 'User logged out successfully',
            },
          },
        }),
        async (c) => {
          const sessionToken = getCookie(c, authConfig.sessionTokenCookie)

          await this.authService.logout(sessionToken)

          deleteCookie(c, authConfig.sessionTokenCookie)

          return c.body(null, 204)
        },
      )
      .post(
        '/confirm/resend',
        async (c) => {
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

          await this.authService.confirmEmail(token)

          return c.body(null, 204)
        },
      )
      .post(
        '/request-reset',
        describeRoute({
          summary: 'Request password reset',
          description: 'Request a password reset token to be sent to the user email.',
          responses: {
            204: {
              description: 'Password reset token sent successfully',
            },
          },
        }),
        validator('json', RequestResetSchema),
        async (c) => {
          const body = c.req.valid('json')

          await this.authService.requestPasswordReset(body.email)

          return c.body(null, 204)
        },
      )
      .post(
        '/reset-password/:token',
        describeRoute({
          summary: 'Reset user password',
          description: 'Reset the user password using the provided reset token.',
          responses: {
            204: {
              description: 'Password reset successfully',
            },
          },
        }),
        validator('param', ResetPasswordParamsSchema),
        validator('json', ResetPasswordBodySchema),
        async (c) => {
          const body = c.req.valid('json')
          const { token } = c.req.valid('param')

          await this.authService.resetPassword(token, body.newPassword)

          return c.body(null, 204)
        },
      )
      .patch(
        '/change-password',
        async (c) => {
          return c.body(null, 204)
        },
      )
      .get(
        '/me',
        async (c) => {
          return c.body(null, 200)
        },
      )

    app
      .use(
        '/google/*',
        googleAuth({
          redirect_uri: `http://${Bun.env.HOST}:${Bun.env.PORT}/api/auth/google/callback`,
          client_id: Bun.env.GOOGLE_ID,
          client_secret: Bun.env.GOOGLE_SECRET,
          scope: ['openid', 'email', 'profile'],
        }),
      )
      .get(
        '/google',
        describeRoute({
          summary: 'Google OAuth2 Authentication',
          description: 'Authenticate users using Google OAuth2.',
        }),
      )
      .get(
        '/google/callback',
        describeRoute({
          summary: 'Google OAuth2 Callback',
          description: 'Handle the callback from Google OAuth2 authentication.',
          responses: {
            204: {
              description: 'User authenticated successfully',
            },
          },
        }),
        async (c) => {
          const googleUser = c.get('user-google') as GoogleUser

          const sessionToken = await this.authService.authenticateGoogleUser(googleUser)

          setCookie(c, authConfig.sessionTokenCookie, sessionToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: authConfig.sessionTokenTtl,
          })

          return c.redirect(`${Bun.env.FRONTEND_URL}/auth/set-password`, 302)
        },
      )

    return app
  }
}
