import type { CacheStore } from './redis-store'
import { authConfig } from '@/config'
import { redisStore } from './redis-store'
import { TokenRepository } from './token.repository'

export interface SessionPayload {
  userId: number
  userAgent: string
}

export class SessionTokenRepository extends TokenRepository<SessionPayload> {
  constructor(store: CacheStore) {
    super(store, { namespace: 'session', ttl: authConfig.sessionTokenTtl })
  }
}

export const sessionTokens = new SessionTokenRepository(redisStore)
