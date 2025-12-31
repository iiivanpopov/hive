import type { RedisClient } from 'bun'
import { redis } from 'bun'
import { authConfig } from '@/config'

export interface ConfirmationTokenPayload {
  userId: number
}

export class ConfirmationTokenRepository {
  namespace = 'confirmation-token'

  constructor(private readonly store: RedisClient) {}

  async create(data: ConfirmationTokenPayload) {
    const token = crypto.randomUUID()
    await this.store.setex(this.serialize(token), authConfig.confirmationTokenTtl, JSON.stringify(data))
    return token
  }

  async resolve(token: string) {
    const data = await this.store.get(this.serialize(token))
    return data ? JSON.parse(data) as ConfirmationTokenPayload : null
  }

  async revoke(token: string) {
    await this.store.del(this.serialize(token))
  }

  serialize(token: string) {
    return `${this.namespace}:${token}`
  }
}

export const confirmationTokens = new ConfirmationTokenRepository(redis)
