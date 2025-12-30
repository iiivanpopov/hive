import type { CacheStore } from './shared/cache-store'
import type { TokenKeyCodec } from './shared/key-codec'
import type { TokenService } from './shared/token.service'
import { authConfig } from '@/config'
import { store } from './shared/cache-store'
import { keyCodec } from './shared/key-codec'
import { tokenService } from './shared/token.service'

export interface ConfirmPayload {
  userId: number
}

export class ConfirmationTokenRepository {
  constructor(
    private readonly tokens: TokenService,
    private readonly keys: TokenKeyCodec,
    private readonly store: CacheStore,
  ) {}

  async create(payload: ConfirmPayload): Promise<string> {
    const token = this.tokens.generate()
    const key = this.keys.serialize('confirm', token)

    await this.store.set(key, payload, authConfig.confirmationTokenTtl)
    return token
  }

  async resolve(token: string): Promise<ConfirmPayload | null> {
    return this.store.get(this.keys.serialize('confirm', token))
  }

  async revoke(token: string): Promise<void> {
    await this.store.del(this.keys.serialize('confirm', token))
  }
}

export const confirmationTokens = new ConfirmationTokenRepository(
  tokenService,
  keyCodec,
  store,
)
