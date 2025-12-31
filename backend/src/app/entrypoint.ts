import { redis } from 'bun'
import { Scalar } from '@scalar/hono-api-reference'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { describeRoute, openAPIRouteHandler, resolver } from 'hono-openapi'
import { cors } from 'hono/cors'
import nodemailer from 'nodemailer'
import z from 'zod'
import { db } from '@/db/instance'
import { factory } from '@/lib/factory'
import { pino } from '@/lib/pino'
import { SmtpService } from '@/lib/smtp'
import { errorMiddleware, loggerMiddleware } from '@/middleware'
import { AuthRouter } from '@/modules/auth/auth.router'
import { AuthService } from '@/modules/auth/auth.service'
import { ConfirmationTokenRepository } from '@/repositories/confirmation-token.repository'
import { ResetPasswordTokenRepository } from '@/repositories/reset-password.token.repository'
import { SessionTokenRepository } from '@/repositories/session-token.repository'
import { Router } from './router'

migrate(db, { migrationsFolder: './drizzle' })
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

const smtpService = new SmtpService(transporter)
const confirmationTokens = new ConfirmationTokenRepository(redis)
const resetPasswordTokens = new ResetPasswordTokenRepository(redis)
const sessionTokens = new SessionTokenRepository(redis)

const router = new Router(
  new AuthRouter(
    new AuthService(db, smtpService, confirmationTokens, resetPasswordTokens, sessionTokens),
  ),
).init()

export const app = factory.createApp()
  .onError(errorMiddleware())
  .use(cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:4173',
      'http://frontend:80',
    ],
    credentials: true,
  }))
  .use(loggerMiddleware())
  .route('/api', router)
  .get('/health', describeRoute({
    description: 'Health check',
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: resolver(z.object({
              status: z.literal('ok'),
            })),
          },
        },
      },
    },
  }), c => c.json({ status: 'ok' }))

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
  .get('/docs', Scalar({ url: '/openapi' }))
  .get('/', c => c.redirect('/docs'))

const server = Bun.serve({
  fetch: app.fetch,
})

pino.info(`Server started on ${server.url}`)
