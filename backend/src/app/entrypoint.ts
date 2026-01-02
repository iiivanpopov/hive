import { Scalar } from '@scalar/hono-api-reference'
import { redis } from 'bun'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { openAPIRouteHandler } from 'hono-openapi'
import { cors } from 'hono/cors'
import path from 'node:path'
import nodemailer from 'nodemailer'

import { db } from '@/db/instance'
import { factory } from '@/lib/factory'
import { MailService } from '@/lib/mail'
import { pino } from '@/lib/pino'
import { errorMiddleware, loggerMiddleware } from '@/middleware'
import { AuthRouter } from '@/modules/auth'
import { CommunitiesRouter } from '@/modules/communities'
import { InvitationsCron, InvitationsRouter } from '@/modules/invitations'
import { ConfirmationTokenRepository } from '@/repositories/confirmation-token.repository'
import { ResetPasswordTokenRepository } from '@/repositories/reset-password.token.repository'
import { SessionTokenRepository } from '@/repositories/session-token.repository'

import { Router } from './router'

migrate(db, { migrationsFolder: path.resolve(__dirname, '../../drizzle') })
pino.info('Database migrated successfully')

const transporter = nodemailer.createTransport({
  host: Bun.env.SMTP_HOST,
  port: Number(Bun.env.SMTP_PORT),
  secure: false,
  auth: {
    user: Bun.env.SMTP_USER,
    pass: Bun.env.SMTP_PASSWORD,
  },
})

const mailService = new MailService(transporter)
const confirmationTokensRepository = new ConfirmationTokenRepository(redis)
const resetPasswordTokensRepository = new ResetPasswordTokenRepository(redis)
const sessionTokensRepository = new SessionTokenRepository(redis)

const router = new Router(
  new AuthRouter(
    db,
    mailService,
    confirmationTokensRepository,
    resetPasswordTokensRepository,
    sessionTokensRepository,
  ),
  new CommunitiesRouter(
    db,
    sessionTokensRepository,
  ),
  new InvitationsRouter(
    db,
    sessionTokensRepository,
  ),
).init()

const invitationsCron = new InvitationsCron(db)
invitationsCron.init()

export const app = factory.createApp()
  .onError(errorMiddleware())
  .use(loggerMiddleware())
  .use(cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:4173',
      'http://frontend:80',
    ],
    credentials: true,
  }))
  .route('/', router)
  .get('/health', c => c.json({ status: 'ok' }))

app
  .get('/openapi', openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: 'Hive API',
        version: '0.0.0',
        description: 'API documentation for Hive backend',
      },
      servers: [
        { url: `http://${Bun.env.HOST}:${Bun.env.PORT}` },
      ],
    },
  }))
  .get('/', Scalar({ url: '/openapi' }))

const server = Bun.serve({
  fetch: app.fetch,
})

pino.info(`Server started on ${server.url}`)
