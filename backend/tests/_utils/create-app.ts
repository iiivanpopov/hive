import { Router } from '@/app/router'
import { factory } from '@/lib/factory'
import { MailService } from '@/lib/mail'
import { errorMiddleware } from '@/middleware'
import { AuthRouter } from '@/modules/auth/auth.router'
import { CommunitiesRouter } from '@/modules/communities/communities.router'
import { ConfirmationTokenRepository } from '@/repositories/confirmation-token.repository'
import { ResetPasswordTokenRepository } from '@/repositories/reset-password.token.repository'
import { SessionTokenRepository } from '@/repositories/session-token.repository'

import { memoryDatabase } from './database'
import { memoryCache } from './memory-cache'

export function createApp() {
  const confirmationTokens = new ConfirmationTokenRepository(memoryCache)
  const resetPasswordTokens = new ResetPasswordTokenRepository(memoryCache)
  const sessionTokens = new SessionTokenRepository(memoryCache)
  const smtpService = new MailService({
    async sendMail(options) {
      memoryCache.setex(`${options.to}-last-email`, 3600, JSON.stringify(options))
      return Promise.resolve()
    },
  })

  const router = new Router(
    new AuthRouter(
      memoryDatabase,
      smtpService,
      confirmationTokens,
      resetPasswordTokens,
      sessionTokens,
    ),
    new CommunitiesRouter(
      memoryDatabase,
      sessionTokens,
    ),
  ).init()

  const app = factory.createApp()
    .onError(errorMiddleware())
    .route('/', router)

  return app
}
