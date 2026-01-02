import type { KeyValueStore } from '@/types/interfaces'

import { authConfig } from '@/config'

export interface ConfirmationTokenPayload {
  userId: number
}

export class ConfirmationTokenRepository {
  namespace = 'confirmation-token'

  constructor(private readonly store: KeyValueStore) {}

  async create(data: ConfirmationTokenPayload) {
    const token = crypto.randomUUID()
    await this.store.setex(this.serialize(token), authConfig.confirmationTokenTtl, JSON.stringify(data))
    return token
  }

  async incrementAttempt(email: string) {
    const key = this.serialize(`${this.hashEmail(email)}:attempts`)

    const attempts = await this.store.incr(key)
    if (attempts === 1)
      await this.store.expire(key, authConfig.confirmationEmailRateLimitTime)

    return attempts
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

  hashEmail(email: string) {
    return new Bun.CryptoHasher('sha256', Bun.env.PASSWORD_RESET_HASH_KEY)
      .update(email)
      .digest('hex')
  }
}
