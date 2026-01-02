import type { KeyValueStore } from '@/types/interfaces'

import { authConfig } from '@/config'

export interface SessionTokenPayload {
  userId: number
  userAgent: string
}

export class SessionTokenRepository {
  namespace = 'session-token'

  constructor(private readonly store: KeyValueStore) {}

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
