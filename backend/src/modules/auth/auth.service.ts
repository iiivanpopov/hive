import type { RegisterBody } from './schema/register.schema'
import { eq } from 'drizzle-orm/sql/expressions/conditions'
import { db } from '@/db/instance'
import { confirmTokens, sessions, users } from '@/db/schema'
import { ApiException } from '@/lib/api-exception'
import { pino } from '@/lib/pino'
import { smtp } from '@/lib/smtp'
import { generateToken } from '@/lib/utils'

async function sendConfirmationEmail(email: string, token: string) {
  if (Bun.env.SMTP_ENABLE !== 'true')
    return

  return smtp.sendMail({
    from: `"Hive" <${Bun.env.SMTP_USER}>`,
    to: email,
    subject: 'Welcome to Hive!',
    html: `<h1>Welcome to Hive, ${email}!</h1><p>Thank you for registering.</p><p>Please confirm your account by clicking <a href="${Bun.env.FRONTEND_URL}/confirm?token=${token}">here</a>.</p>`,
  })
}

export async function register(data: RegisterBody) {
  const userExists = await db.query.users.findMany({
    where: {
      email: data.email,
      username: data.username,
    },
  })
  if (userExists.length > 0)
    throw ApiException.BadRequest('User with given username or email already exists', 'USER_EXISTS')

  const passwordHash = await Bun.password.hash(data.password)
  const [user] = await db.insert(users).values({
    username: data.username,
    email: data.email,
    passwordHash,
  }).returning()
  pino.debug(`Created user: ${JSON.stringify(user)}`)

  const sessionToken = generateToken()
  const [session] = await db.insert(sessions)
    .values({
      userId: user.id,
      token: sessionToken,
    })
    .returning()
  pino.debug(`Created session: ${JSON.stringify(session)}`)

  const confirmationToken = generateToken()
  const [confirmation] = await db.insert(confirmTokens)
    .values({
      userId: user.id,
      token: confirmationToken,
    })
    .returning()
  pino.debug(`Created confirmation token: ${JSON.stringify(confirmation)}`)

  const mail = await sendConfirmationEmail(data.email, confirmationToken)
  pino.debug(`Sent email: ${JSON.stringify(mail)}`)

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

  if (tokenExists.user!.emailConfirmed) {
    pino.debug(`User ${tokenExists.user!.id} already confirmed`)
    return
  }

  await db.update(users)
    .set({ emailConfirmed: true })
    .where(eq(users.id, tokenExists.userId))
  pino.debug(`User ${tokenExists.user!.id} email confirmed`)

  await db.delete(confirmTokens)
    .where(eq(confirmTokens.id, tokenExists.id))
  pino.debug(`Deleted confirmation token ${tokenExists.id}`)
}
