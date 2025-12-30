import type { CacheStore } from './shared/cache-store'
import type { TokenKeyCodec } from './shared/key-codec'
import type { TokenService } from './shared/token.service'
import { authConfig } from '@/config'
import { store } from './shared/cache-store'
import { keyCodec } from './shared/key-codec'
import { tokenService } from './shared/token.service'

export interface SessionPayload {
  userId: number
  userAgent: string
}

export class SessionTokenRepository {
  constructor(
    private readonly tokens: TokenService,
    private readonly keys: TokenKeyCodec,
    private readonly store: CacheStore,
  ) {}

  async create(payload: SessionPayload): Promise<string> {
    const token = this.tokens.generate()
    const key = this.keys.serialize('session', token)

    await this.store.set(key, payload, authConfig.sessionTokenTtl)
    return token
  }

  async resolve(token: string): Promise<SessionPayload | null> {
    return this.store.get(this.keys.serialize('session', token))
  }

  async revoke(token: string): Promise<void> {
    await this.store.del(this.keys.serialize('session', token))
  }

  async refresh(token: string): Promise<void> {
    await this.store.expire(this.keys.serialize('session', token), authConfig.sessionTokenTtl)
  }
}

export const sessionTokens = new SessionTokenRepository(
  tokenService,
  keyCodec,
  store,
)
