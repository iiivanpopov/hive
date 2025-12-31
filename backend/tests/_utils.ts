import { Database } from 'bun:sqlite'
import { Router } from '@/app/router'
import { createDb } from '@/db/instance'
import { factory } from '@/lib/factory'
import { SmtpService } from '@/lib/smtp'
import { errorMiddleware } from '@/middleware'
import { AuthRouter } from '@/modules/auth/auth.router'
import { AuthService } from '@/modules/auth/auth.service'
import { ConfirmationTokenRepository } from '@/repositories/confirmation-token.repository'
import { ResetPasswordTokenRepository } from '@/repositories/reset-password.token.repository'
import { SessionTokenRepository } from '@/repositories/session-token.repository'
import { MemoryStore } from './_memory-store'

export const memoryStore = new MemoryStore()

const memoryClient = new Database(':memory:')
export const memoryDb = createDb(memoryClient)

export function createTestApp() {
  const confirmationTokens = new ConfirmationTokenRepository(memoryStore)
  const resetPasswordTokens = new ResetPasswordTokenRepository(memoryStore)
  const sessionTokens = new SessionTokenRepository(memoryStore)
  const smtpService = new SmtpService({
    sendMail(options) {
      memoryStore.setex(`${options.to}-last-email`, 3600, JSON.stringify(options))
      return Promise.resolve()
    },
  })

  const router = new Router(
    new AuthRouter(
      new AuthService(memoryDb, smtpService, confirmationTokens, resetPasswordTokens, sessionTokens),
    ),
  ).init()

  const app = factory.createApp()
    .onError(errorMiddleware())
    .route('/api', router)

  return app
}
