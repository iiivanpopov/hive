import type { LoginBody, RegisterBody } from './schema'
import type { User } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { envConfig } from '@/config'
import { db } from '@/db/instance'
import { confirmTokens, sessions, users } from '@/db/schema'
import { ApiException } from '@/lib/api-exception'
import { pino } from '@/lib/pino'
import { smtp } from '@/lib/smtp'
import { generateToken, normalizeUserAgent } from '@/lib/utils'

async function sendConfirmationEmail(user: User, token: string) {
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
  pino.debug(`Created user: ${JSON.stringify(user)}`)

  const sessionToken = generateToken()
  const [session] = await db
    .insert(sessions)
    .values({
      userId: user.id,
      userAgent: normalizeUserAgent(userAgent),
      token: sessionToken,
    })
    .returning()
  pino.debug(`Created session: ${JSON.stringify(session)}`)

  const confirmationToken = generateToken()
  const [confirmation] = await db
    .insert(confirmTokens)
    .values({
      userId: user.id,
      token: confirmationToken,
    })
    .returning()
  pino.debug(`Created confirmation token: ${JSON.stringify(confirmation)}`)

  if (Bun.env.SMTP_ENABLE === 'true' && !envConfig.isTest) {
    const mail = await sendConfirmationEmail(user, confirmationToken)
    pino.debug(`Sent email: ${JSON.stringify(mail)}`)
  }

  return sessionToken
}

export async function confirmEmail(token: string) {
  const [tokenExists] = await db.query.confirmTokens.findMany({
    where: { token },
    with: {
      user: true,
    },
  })
  if (!tokenExists)
    throw ApiException.BadRequest('Invalid confirmation token', 'INVALID_TOKEN')

  if (tokenExists.user!.emailConfirmed)
    return pino.debug(`User ${tokenExists.user!.id} already confirmed`)

  await db
    .update(users)
    .set({ emailConfirmed: true })
    .where(eq(users.id, tokenExists.userId))
  pino.debug(`User ${tokenExists.user!.id} email confirmed`)

  await db
    .delete(confirmTokens)
    .where(eq(confirmTokens.id, tokenExists.id))
  pino.debug(`Deleted confirmation token ${tokenExists.id}`)
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

  const sessionToken = generateToken()
  const [session] = await db
    .insert(sessions)
    .values({
      userId: user.id,
      userAgent: normalizeUserAgent(userAgent),
      token: sessionToken,
    })
    .returning()
  pino.debug(`Created session: ${JSON.stringify(session)}`)

  return sessionToken
}

export async function logout(sessionToken: string | undefined) {
  if (!sessionToken)
    return

  await db
    .delete(sessions)
    .where(eq(sessions.token, sessionToken))
  pino.debug(`Deleted session with token: ${sessionToken}`)
}
