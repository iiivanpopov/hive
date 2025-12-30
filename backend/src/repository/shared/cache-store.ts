import type { RedisClient } from 'bun'
import { redis } from 'bun'

export interface CacheStore {
  set: (key: string, value: unknown, ttlSec: number) => Promise<void>
  get: <T>(key: string) => Promise<T | null>
  del: (key: string) => Promise<void>
  expire: (key: string, ttlSec: number) => Promise<void>
}

export class RedisStore implements CacheStore {
  constructor(private readonly redis: RedisClient) {}

  async set(key: string, value: unknown, ttlSec: number): Promise<void> {
    const wrapped = JSON.stringify({ v: 1, data: value })
    await this.redis.set(key, wrapped, 'EX', ttlSec)
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key)
    if (!raw)
      return null

    const parsed = JSON.parse(raw) as { v: number, data: T }
    return parsed.data
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key)
  }

  async expire(key: string, ttlSec: number): Promise<void> {
    await this.redis.expire(key, ttlSec)
  }
}

export const store = new RedisStore(redis)
