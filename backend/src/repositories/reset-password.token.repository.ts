import { authConfig } from '@/config'

export interface ResetPasswordTokenStore {
  setex: (key: string, ttl: number, value: string) => Promise<void | 'OK'>
  get: (key: string) => Promise<string | null>
  del: (key: string) => Promise<void | number>
  expire: (key: string, ttl: number) => Promise<void | number>
  incr: (key: string) => Promise<number>
}

export interface ResetPasswordTokenPayload {
  userId: number
}

export class ResetPasswordTokenRepository {
  namespace = 'reset-password-token'

  constructor(private readonly store: ResetPasswordTokenStore) {}

  async create(data: ResetPasswordTokenPayload) {
    const token = crypto.randomUUID()
    await this.store.setex(this.serialize(token), authConfig.resetPasswordTokenTtl, JSON.stringify(data))
    return token
  }

  async incrementAttempt(email: string) {
    const key = this.serialize(`${this.hashEmail(email)}:attempts`)

    const attempts = await this.store.incr(key)
    if (attempts === 1)
      await this.store.expire(key, authConfig.resetPasswordTokenAttemptsTtl)

    return attempts
  }

  async resolve(token: string) {
    const data = await this.store.get(this.serialize(token))
    return data ? JSON.parse(data) as ResetPasswordTokenPayload : null
  }

  async revoke(token: string) {
    await this.store.del(this.serialize(token))
  }

  serialize(token: string) {
    return `${this.namespace}:${token}`
  }

  hashEmail(email: string) {
    return new Bun.CryptoHasher('sha256', Bun.env.EMAIL_RESET_RATE_LIMIT_KEY)
      .update(email)
      .digest('hex')
  }
}
