import { Scalar } from '@scalar/hono-api-reference'
import { redis } from 'bun'
import { openAPIRouteHandler } from 'hono-openapi'
import nodemailer from 'nodemailer'

import { db } from '@/db/instance'
import { migrateDatabase } from '@/db/utils'
import { MailService } from '@/lib/mail'
import { pino } from '@/lib/pino'
import { InvitationsCron } from '@/modules/invitations'
import { ConfirmationTokenRepository } from '@/repositories/confirmation-token.repository'
import { ResetPasswordTokenRepository } from '@/repositories/reset-password.token.repository'
import { SessionTokenRepository } from '@/repositories/session-token.repository'

import { createApp } from './create-app'

migrateDatabase(db)
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

const invitationsCron = new InvitationsCron(db)
invitationsCron.init()

export const app = createApp(
  db,
  mailService,
  confirmationTokensRepository,
  resetPasswordTokensRepository,
  sessionTokensRepository,
)

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
