import { authConfig } from '@/config'

export interface SessionTokenStore {
  setex: (key: string, ttl: number, value: string) => Promise<void | 'OK'>
  get: (key: string) => Promise<string | null>
  del: (key: string) => Promise<void | number>
}

export interface SessionTokenPayload {
  userId: number
  userAgent: string
}

export class SessionTokenRepository {
  namespace = 'session-token'

  constructor(private readonly store: SessionTokenStore) {}

  async create(data: SessionTokenPayload) {
    const token = crypto.randomUUID()
    await this.store.setex(this.serialize(token), authConfig.sessionTokenTtl, JSON.stringify(data))
    return token
  }

  async resolve(token: string) {
    const data = await this.store.get(this.serialize(token))
    return data ? JSON.parse(data) as SessionTokenPayload : null
  }

  async revoke(token: string) {
    await this.store.del(this.serialize(token))
  }

  serialize(token: string) {
    return `${this.namespace}:${token}`
  }
}
