import type { CacheStore } from './redis-store'
import { authConfig } from '@/config'
import { redisStore } from './redis-store'
import { TokenRepository } from './token.repository'

export interface ConfirmPayload {
  userId: number
}

export class ConfirmationTokenRepository extends TokenRepository<ConfirmPayload> {
  constructor(store: CacheStore) {
    super(store, { namespace: 'confirm', ttl: authConfig.confirmationTokenTtl })
  }
}

export const confirmationTokens = new ConfirmationTokenRepository(redisStore)
