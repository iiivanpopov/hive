import type { CacheStore } from './redis-store'

export interface TokenRepositoryOptions {
  namespace: string
  ttl: number
}

export abstract class TokenRepository<TPayload> {
  constructor(
    protected readonly store: CacheStore,
    protected readonly options: TokenRepositoryOptions,
  ) {}

  async create(payload: TPayload): Promise<string> {
    const token = this.generateToken()
    await this.store.set(this.serializeKey(token), payload, this.options.ttl)
    return token
  }

  async resolve(token: string): Promise<TPayload | null> {
    return this.store.get<TPayload>(this.serializeKey(token))
  }

  async revoke(token: string): Promise<void> {
    await this.store.del(this.serializeKey(token))
  }

  async refresh(token: string): Promise<void> {
    await this.store.expire(this.serializeKey(token), this.options.ttl)
  }

  protected generateToken(bytes = 32): string {
    return crypto.getRandomValues(new Uint8Array(bytes)).toHex()
  }

  protected serializeKey(token: string): string {
    return `${this.options.namespace}:${token}`
  }
}
