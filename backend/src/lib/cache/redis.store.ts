import type { RedisClient } from 'bun'
import type { CacheStore } from './store.interface'
import { redis } from 'bun'

export function createRedisStore(client: RedisClient): RedisClient & CacheStore {
  return new Proxy(client, {
    get(target, prop) {
      if (prop === 'get') {
        return async <T>(key: string) => {
          const raw = await target.get(key)
          return raw ? JSON.parse(raw) as T : null
        }
      }

      if (prop === 'set') {
        return async (key: string, value: unknown, ttlSec: number) => {
          await target.set(key, JSON.stringify(value), 'EX', ttlSec)
        }
      }
      return (target as any)[prop]
    },
  }) as RedisClient & CacheStore
}

export const redisStore = createRedisStore(redis)
