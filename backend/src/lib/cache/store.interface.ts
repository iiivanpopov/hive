export interface CacheStore {
  set: (key: string, value: unknown, ttlSec: number) => Promise<void>
  get: <T>(key: string) => Promise<T | null>
  del: (key: string) => Promise<void>
  expire: (key: string, ttlSec: number) => Promise<void>
}
