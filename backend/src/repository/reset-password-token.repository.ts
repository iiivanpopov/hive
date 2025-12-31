import type { CacheStore } from '@/lib/cache'
import { authConfig } from '@/config'
import { redisStore } from '@/lib/cache'
import { TokenRepository } from './token.repository'

export interface ResetPasswordPayload {
  userId: number
  email: string
  attemptCount: number
}

export class ResetPasswordTokenRepository extends TokenRepository<ResetPasswordPayload> {
  constructor(store: CacheStore) {
    super(store, { namespace: 'reset-password', ttl: authConfig.resetPasswordTokenTtl })
  }

  /**
   * Get the current attempt count for an email address
   */
  async getAttemptCount(email: string): Promise<number> {
    const key = this.serializeAttemptKey(email)
    const count = await this.store.get<number>(key)
    return count ?? 0
  }

  /**
   * Increment the attempt count for an email address
   */
  async incrementAttemptCount(email: string): Promise<number> {
    const key = this.serializeAttemptKey(email)
    const currentCount = await this.getAttemptCount(email)
    const newCount = currentCount + 1
    await this.store.set(key, newCount, this.options.ttl)
    return newCount
  }

  /**
   * Clear the attempt count for an email address
   */
  async clearAttemptCount(email: string): Promise<void> {
    const key = this.serializeAttemptKey(email)
    await this.store.del(key)
  }

  private serializeAttemptKey(email: string): string {
    return `${this.options.namespace}:attempts:${email}`
  }
}

export const resetPasswordTokens = new ResetPasswordTokenRepository(redisStore)
