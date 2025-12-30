import type { RedisClient } from 'bun'
import { redis } from 'bun'

export interface CacheStore {
  set: (key: string, value: unknown, ttlSec: number) => Promise<void>
  get: <T>(key: string) => Promise<T | null>
  del: (key: string) => Promise<void>
  expire: (key: string, ttlSec: number) => Promise<void>
}

export class RedisStore implements CacheStore {
  constructor(private readonly client: RedisClient) {}

  async set(key: string, value: unknown, ttlSec: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSec)
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key)
    return raw ? JSON.parse(raw) as T : null
  }

  async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  async expire(key: string, ttlSec: number): Promise<void> {
    await this.client.expire(key, ttlSec)
  }
}

export const redisStore = new RedisStore(redis)
