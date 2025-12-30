import type { LoginBody, RegisterBody } from './schema'
import type { User } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { envConfig } from '@/config'
import { db } from '@/db/instance'
import { users } from '@/db/schema'
import { ApiException } from '@/lib/api-exception'
import { pino } from '@/lib/pino'
import { smtp } from '@/lib/smtp'
import { normalizeUserAgent } from '@/lib/utils'
import { confirmationTokens, sessionTokens } from '@/repository'

async function sendConfirmEmail(user: User, token: string) {
  return smtp.sendMail({
    from: `"Hive" <${Bun.env.SMTP_USER}>`,
    to: user.email,
    subject: 'Welcome to Hive!',
    html: `
      <h1>Welcome to Hive, ${user.username}!</h1>
      <p>Thank you for registering.</p>
      <p>
        Please confirm your account by clicking <a href="${Bun.env.FRONTEND_URL}/confirm?token=${token}">here</a>.
      </p>`,
  })
}

export async function register(data: RegisterBody, userAgent?: string) {
  const userExists = await db.query.users.findMany({
    where: {
      OR: [
        { email: data.email },
        { username: data.username },
      ],
    },
  })
  if (userExists.length > 0)
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
    throw ApiException.BadRequest('Invalid confirmation token', 'INVALID_TOKEN')

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
