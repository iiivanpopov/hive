import { authConfig } from '@/config'

export interface ConfirmationTokenStore {
  setex: (key: string, ttl: number, value: string) => Promise<void | 'OK'>
  get: (key: string) => Promise<string | null>
  del: (key: string) => Promise<void | number>
}

export interface ConfirmationTokenPayload {
  userId: number
}

export class ConfirmationTokenRepository {
  namespace = 'confirmation-token'

  constructor(private readonly store: ConfirmationTokenStore) {}

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
