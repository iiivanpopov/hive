import type { GoogleUser } from '@hono/oauth-providers/google'
import type { LoginBody } from './schema/login.schema'
import type { RegisterBody } from './schema/register.schema'
import type { User } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { envConfig } from '@/config'
import { db } from '@/db/instance'
import { users } from '@/db/schema'
import { ApiException } from '@/lib/api-exception'
import { pino } from '@/lib/pino'
import { smtp } from '@/lib/smtp'
import { normalizeUserAgent } from '@/lib/utils'
import { confirmationTokens } from '@/repositories/confirmation-token.repository'
import { resetPasswordTokens } from '@/repositories/reset-password.token.repository'
import { sessionTokens } from '@/repositories/session-token.repository'

async function sendConfirmEmail(user: User, token: string) {
  return smtp.sendMail({
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

export async function register(data: RegisterBody, userAgent?: string) {
  const [userExists] = await db.query.users.findMany({
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
  const [user] = await db
    .insert(users)
    .values({
      username: data.username,
      email: data.email,
      passwordHash,
    })
    .returning()
  pino.debug(`Created user ${user.id}`)

  const sessionToken = await sessionTokens.create({ userId: user.id, userAgent: normalizeUserAgent(userAgent) })
  pino.debug(`Created session ${sessionToken}`)

  const confirmationToken = await confirmationTokens.create({ userId: user.id })
  pino.debug(`Created confirm token ${confirmationToken}`)

  if (Bun.env.SMTP_ENABLE === 'true' && !envConfig.isTest) {
    await sendConfirmEmail(user, confirmationToken)
    pino.debug(`Sent email to ${user.email}`)
  }

  return sessionToken
}

export async function confirmEmail(token: string) {
  const confirmationToken = await confirmationTokens.resolve(token)
  if (!confirmationToken)
    throw ApiException.BadRequest('Invalid confirmation token', 'INVALID_CONFIRMATION_TOKEN')

  const user = await db.query.users.findFirst({
    where: { id: confirmationToken.userId },
  })

  await db
    .update(users)
    .set({ emailConfirmed: true })
    .where(eq(users.id, confirmationToken.userId))
  pino.debug(`Email ${user!.email} confirmed`)

  await confirmationTokens.revoke(token)
}

export async function login(data: LoginBody, userAgent?: string) {
  const [user] = await db.query.users.findMany({
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

  const sessionToken = await sessionTokens.create({ userId: user.id, userAgent: normalizeUserAgent(userAgent) })
  pino.debug(`Created session ${sessionToken}`)

  return sessionToken
}

export async function logout(sessionToken: string | undefined) {
  if (!sessionToken)
    return

  await sessionTokens.revoke(sessionToken)
  pino.debug(`Deleted session ${sessionToken}`)
}

const GoogleOAuthUserAgent = 'Google OAuth2'

export async function authenticateGoogleUser(googleUser: GoogleUser) {
  const [userExists] = await db.query.users.findMany({
    where: { email: googleUser.email },
  })
  if (userExists) {
    const sessionToken = await sessionTokens.create({ userId: userExists.id, userAgent: GoogleOAuthUserAgent })
    pino.debug(`Created session ${sessionToken}`)

    return sessionToken
  }

  const randomPassword = crypto.getRandomValues(new Uint8Array(8)).toHex()
  const passwordHash = await Bun.password.hash(randomPassword)

  const [user] = await db
    .insert(users)
    .values({
      email: googleUser.email,
      username: googleUser.email.split('@')[0],
      emailConfirmed: true,
      passwordHash,
    })
    .returning()
  pino.debug(`Created user with email ${user.email}`)

  const sessionToken = await sessionTokens.create({ userId: user!.id, userAgent: GoogleOAuthUserAgent })
  pino.debug(`Created session ${sessionToken}`)

  return sessionToken
}

async function sendPasswordResetEmail(user: User, resetToken: string) {
  await smtp.sendMail({
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

export async function requestPasswordReset(email: string) {
  const [user] = await db.query.users.findMany({
    where: { email },
  })

  if (!user)
    return pino.debug(`Password reset requested for non-existent email: ${email}`)

  const attempts = await resetPasswordTokens.incrementAttempt(email)
  if (attempts > 5)
    throw ApiException.TooManyRequests('Too many password reset attempts. Please try again later.', 'TOO_MANY_PASSWORD_RESET_ATTEMPTS')

  const resetToken = await resetPasswordTokens.create({ userId: user.id })

  if (Bun.env.SMTP_ENABLE === 'true' && !envConfig.isTest) {
    await sendPasswordResetEmail(user, resetToken)
    pino.debug(`Sent password reset email to ${user.email}`)
  }
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await resetPasswordTokens.resolve(token)
  if (!resetToken)
    throw ApiException.BadRequest('Invalid reset password token', 'INVALID_RESET_PASSWORD_TOKEN')

  const passwordHash = await Bun.password.hash(newPassword)
  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, resetToken.userId))
  pino.debug(`Password reset for user ${resetToken.userId}`)

  await resetPasswordTokens.revoke(token)
}
