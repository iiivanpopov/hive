import { cors } from 'hono/cors'

import type { DrizzleDatabase } from '@/db/utils'
import type { MailService } from '@/lib/mail'
import type { ConfirmationTokenRepository } from '@/repositories/confirmation-token.repository'
import type { ResetPasswordTokenRepository } from '@/repositories/reset-password.token.repository'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'

import { factory } from '@/lib/factory'
import { errorMiddleware, loggerMiddleware } from '@/middleware'
import { AuthRouter } from '@/modules/auth'
import { CommunitiesRouter } from '@/modules/communities'
import { CommunityMembersRouter } from '@/modules/community-members'
import { InvitationsRouter } from '@/modules/invitations'

import { Router } from './router'

export function createApp(
  db: DrizzleDatabase,
  mailService: MailService,
  confirmationTokensRepository: ConfirmationTokenRepository,
  resetPasswordTokensRepository: ResetPasswordTokenRepository,
  sessionTokensRepository: SessionTokenRepository,
) {
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
    new CommunityMembersRouter(
      db,
      sessionTokensRepository,
    ),
  ).init()

  const app = factory
    .createApp()
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

  return app
}
