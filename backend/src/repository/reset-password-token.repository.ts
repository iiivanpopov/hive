import type { CacheStore } from '@/lib/cache'
import { authConfig } from '@/config'
import { redisStore } from '@/lib/cache'
import { hmac256Hex } from '@/lib/utils'
import { TokenRepository } from './token.repository'

export interface ResetPasswordPayload {
  userId: number
  email: string
  try: number
}

export class ResetPasswordTokenRepository extends TokenRepository<ResetPasswordPayload> {
  constructor(store: CacheStore) {
    super(store, { namespace: 'reset-password', ttl: authConfig.resetPasswordTokenTtl })
  }

  async create(payload: ResetPasswordPayload): Promise<string> {
    const emailHash = hmac256Hex(payload.email)
    await this.store.set(this.serializeKey(emailHash), payload, this.options.ttl)
    return emailHash
  }

  async resolve(email: string): Promise<ResetPasswordPayload | null> {
    const emailHash = hmac256Hex(email)
    return this.store.get<ResetPasswordPayload>(this.serializeKey(emailHash))
  }

  async revoke(email: string): Promise<void> {
    const emailHash = hmac256Hex(email)
    await this.store.del(this.serializeKey(emailHash))
  }
}

export const resetPasswordTokens = new ResetPasswordTokenRepository(redisStore)
