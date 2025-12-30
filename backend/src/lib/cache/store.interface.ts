export interface CacheStore {
  set: (key: string, value: unknown, ttl: number) => Promise<void>
  get: <T>(key: string) => Promise<T | null>
  del: (key: string) => Promise<void>
  expire: (key: string, ttl: number) => Promise<void>
}
