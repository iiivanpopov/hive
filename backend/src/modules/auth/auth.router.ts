import type { GoogleUser } from '@hono/oauth-providers/google'

import { googleAuth } from '@hono/oauth-providers/google'
import { describeRoute, resolver } from 'hono-openapi'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

import type { DrizzleDatabase } from '@/db/instance'
import type { MailService } from '@/lib/mail'
import type { ConfirmationTokenRepository } from '@/repositories/confirmation-token.repository'
import type { ResetPasswordTokenRepository } from '@/repositories/reset-password.token.repository'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'

import { authConfig } from '@/config'
import { toUserDto } from '@/db/schema'
import { factory } from '@/lib/factory'
import { sessionMiddleware, validator } from '@/middleware'

import { AuthService } from './auth.service'
import { ChangePasswordBodySchema } from './schema/change-password.schema'
import { ConfirmEmailResendBodySchema, ConfirmParamsSchema } from './schema/confirm-email.schema'
import { LoginBodySchema } from './schema/login.schema'
import { MeResponseSchema } from './schema/me.schema'
import { RegisterBodySchema } from './schema/register.schema'
import { RequestResetSchema } from './schema/request-reset.schema'
import { ResetPasswordBodySchema, ResetPasswordParamsSchema } from './schema/reset-password.schema'

export class AuthRouter {
  basePath = '/auth'
  authService: AuthService

  constructor(
    private readonly db: DrizzleDatabase,
    private readonly smtpService: MailService,
    private readonly confirmationTokens: ConfirmationTokenRepository,
    private readonly resetPasswordTokens: ResetPasswordTokenRepository,
    private readonly sessionTokens: SessionTokenRepository,
  ) {
    this.authService = new AuthService(
      this.db,
      this.smtpService,
      this.confirmationTokens,
      this.resetPasswordTokens,
      this.sessionTokens,
    )
  }

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
        '/confirm-email/resend',
        describeRoute({
          summary: 'Resend confirmation email',
          description: 'Resend the account confirmation email to the user.',
          responses: {
            204: {
              description: 'Confirmation email resent successfully',
            },
          },
        }),
        validator('json', ConfirmEmailResendBodySchema),
        async (c) => {
          const body = c.req.valid('json')

          await this.authService.resendConfirmationEmail(body.email)

          return c.body(null, 204)
        },
      )
      .post(
        '/confirm-email/:token',
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
        describeRoute({
          summary: 'Change user password',
          description: 'Change the password of the currently authenticated user.',
          responses: {
            204: {
              description: 'Password changed successfully',
            },
          },
        }),
        sessionMiddleware(this.db, this.sessionTokens),
        validator('json', ChangePasswordBodySchema),
        async (c) => {
          const body = c.req.valid('json')
          const user = c.get('user')
          const userAgent = c.req.header('User-Agent')

          const sessionToken = await this.authService.changePassword(user.id, body, userAgent)

          setCookie(c, authConfig.sessionTokenCookie, sessionToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: authConfig.sessionTokenTtl,
          })

          return c.body(null, 204)
        },
      )
      .get(
        '/me',
        sessionMiddleware(this.db, this.sessionTokens),
        describeRoute({
          summary: 'Get current authenticated user',
          description: 'Retrieve the details of the currently authenticated user.',
          responses: {
            200: {
              description: 'Current user retrieved successfully',
              content: {
                'application/json': {
                  schema: resolver(MeResponseSchema),
                },
              },
            },
          },
        }),
        async c => c.json({ user: toUserDto(c.get('user')) }, 200),
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
        '/google/callback',
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
