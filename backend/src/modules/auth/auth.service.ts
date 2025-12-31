import type { GoogleUser } from '@hono/oauth-providers/google'
import type { LoginBody } from './schema/login.schema'
import type { RegisterBody } from './schema/register.schema'
import type { DrizzleDatabase } from '@/db/instance'
import type { User } from '@/db/schema'
import type { SmtpService } from '@/lib/smtp'
import type { ConfirmationTokenRepository } from '@/repositories/confirmation-token.repository'
import type { ResetPasswordTokenRepository } from '@/repositories/reset-password.token.repository'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'
import { eq } from 'drizzle-orm'
import { users } from '@/db/schema'
import { ApiException } from '@/lib/api-exception'
import { pino } from '@/lib/pino'
import { normalizeUserAgent } from '@/lib/utils'

export class AuthService {
  constructor(
    private readonly db: DrizzleDatabase,
    private readonly smtpService: SmtpService,
    private readonly confirmationTokens: ConfirmationTokenRepository,
    private readonly resetPasswordTokens: ResetPasswordTokenRepository,
    private readonly sessionTokens: SessionTokenRepository,
  ) {}

  private async sendConfirmEmail(user: User, token: string) {
    await this.smtpService.sendMail({
      from: `"Hive" <${Bun.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Welcome to Hive!',
      html: `
      <h1>Welcome to Hive, ${user.username}!</h1>
      <p>Thank you for registering.</p>
      <p>
        Please confirm your account by clicking <a href="${Bun.env.FRONTEND_URL}/auth/confirm?token=${token}">here</a>.
      </p>`,
    })
  }

  async register(data: RegisterBody, userAgent?: string) {
    const [userExists] = await this.db.query.users.findMany({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
        ],
      },
    })
    if (userExists)
      throw ApiException.BadRequest('User with given username or email already exists', 'USER_EXISTS')

    const passwordHash = await Bun.password.hash(data.password)
    const [user] = await this.db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
        passwordHash,
      })
      .returning()
    pino.debug(`Created user ${user.id}`)

    const sessionToken = await this.sessionTokens.create({ userId: user.id, userAgent: normalizeUserAgent(userAgent) })
    pino.debug(`Created session ${sessionToken}`)

    const confirmationToken = await this.confirmationTokens.create({ userId: user.id })
    pino.debug(`Created confirm token ${confirmationToken}`)

    if (Bun.env.SMTP_ENABLE === 'true') {
      await this.sendConfirmEmail(user, confirmationToken)
      pino.debug(`Sent email to ${user.email}`)
    }

    return sessionToken
  }

  async confirmEmail(token: string) {
    const confirmationToken = await this.confirmationTokens.resolve(token)
    if (!confirmationToken)
      throw ApiException.BadRequest('Invalid confirmation token', 'INVALID_CONFIRMATION_TOKEN')

    const user = await this.db.query.users.findFirst({
      where: { id: confirmationToken.userId },
    })

    await this.db
      .update(users)
      .set({ emailConfirmed: true })
      .where(eq(users.id, confirmationToken.userId))
    pino.debug(`Email ${user!.email} confirmed`)

    await this.confirmationTokens.revoke(token)
  }

  async login(data: LoginBody, userAgent?: string) {
    const [user] = await this.db.query.users.findMany({
      where: {
        OR: [
          { email: data.identity },
          { username: data.identity },
        ],
      },
    })
    if (!user)
      throw ApiException.Unauthorized('Invalid credentials', 'INVALID_CREDENTIALS')

    const passwordMatch = await Bun.password.verify(data.password, user.passwordHash)
    if (!passwordMatch)
      throw ApiException.Unauthorized('Invalid credentials', 'INVALID_CREDENTIALS')

    const sessionToken = await this.sessionTokens.create({ userId: user.id, userAgent: normalizeUserAgent(userAgent) })
    pino.debug(`Created session ${sessionToken}`)

    return sessionToken
  }

  async logout(sessionToken: string | undefined) {
    if (!sessionToken)
      return

    await this.sessionTokens.revoke(sessionToken)
    pino.debug(`Deleted session ${sessionToken}`)
  }

  GoogleOAuthUserAgent = 'Google OAuth2'

  async authenticateGoogleUser(googleUser: GoogleUser) {
    const [userExists] = await this.db.query.users.findMany({
      where: { email: googleUser.email },
    })
    if (userExists) {
      const sessionToken = await this.sessionTokens.create({ userId: userExists.id, userAgent: this.GoogleOAuthUserAgent })
      pino.debug(`Created session ${sessionToken}`)

      return sessionToken
    }

    const randomPassword = crypto.getRandomValues(new Uint8Array(8)).toHex()
    const passwordHash = await Bun.password.hash(randomPassword)

    const [user] = await this.db
      .insert(users)
      .values({
        email: googleUser.email,
        username: googleUser.email.split('@')[0],
        emailConfirmed: true,
        passwordHash,
      })
      .returning()
    pino.debug(`Created user with email ${user.email}`)

    const sessionToken = await this.sessionTokens.create({ userId: user!.id, userAgent: this.GoogleOAuthUserAgent })
    pino.debug(`Created session ${sessionToken}`)

    return sessionToken
  }

  private async sendPasswordResetEmail(user: User, resetToken: string) {
    await this.smtpService.sendMail({
      from: `"Hive" <${Bun.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>We received a request to reset your password.</p>
        <p>
          Please reset your password by clicking <a href="${Bun.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}">here</a>.
        </p>
        <p>If you did not request a password reset, please ignore this email.</p>`,
    })
  }

  async requestPasswordReset(email: string) {
    const [user] = await this.db.query.users.findMany({
      where: { email },
    })

    if (!user)
      return pino.debug(`Password reset requested for non-existent email: ${email}`)

    const attempts = await this.resetPasswordTokens.incrementAttempt(email)
    if (attempts > 5)
      throw ApiException.TooManyRequests('Too many password reset attempts. Please try again later.', 'TOO_MANY_PASSWORD_RESET_ATTEMPTS')

    const resetToken = await this.resetPasswordTokens.create({ userId: user.id })
    if (Bun.env.SMTP_ENABLE === 'true') {
      await this.sendPasswordResetEmail(user, resetToken)
      pino.debug(`Sent password reset email to ${user.email}`)
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.resetPasswordTokens.resolve(token)
    if (!resetToken)
      throw ApiException.BadRequest('Invalid reset password token', 'INVALID_RESET_PASSWORD_TOKEN')

    const passwordHash = await Bun.password.hash(newPassword)
    await this.db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, resetToken.userId))
    pino.debug(`Password reset for user ${resetToken.userId}`)

    await this.resetPasswordTokens.revoke(token)
  }
}
