export class MemoryCache {
  private store: Map<string, string> = new Map()

  async reset(): Promise<void> {
    this.store.clear()
  }

  async setex(key: string, ttl: number, value: string): Promise<void | 'OK'> {
    this.store.set(key, value)
    setTimeout(() => {
      this.store.delete(key)
    }, ttl * 1000)
    return 'OK'
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null
  }

  async del(key: string): Promise<void | number> {
    const existed = this.store.delete(key)
    return existed ? 1 : 0
  }

  async expire(key: string, ttl: number): Promise<void | number> {
    if (this.store.has(key)) {
      setTimeout(() => {
        this.store.delete(key)
      }, ttl * 1000)
      return 1
    }
    return 0
  }

  async incr(key: string): Promise<number> {
    const current = Number.parseInt(this.store.get(key) || '0')
    const next = current + 1
    this.store.set(key, next.toString())
    return next
  }
}

export const memoryCache = new MemoryCache()
