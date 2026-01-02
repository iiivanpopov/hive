import { mock } from 'bun:test'

import type { KeyValueStore } from '@/types/interfaces'

export class CacheMock implements KeyValueStore {
  private store = new Map<string, string>()
  private timers = new Map<string, Timer>()

  reset = mock(async () => {
    this.store.clear()
    this.timers.forEach(clearTimeout)
    this.timers.clear()
  })

  setex = mock<KeyValueStore['setex']>(
    async (key, ttl, value) => {
      this.store.set(key, value)
      this.setExpiry(key, ttl)
      return 'OK'
    },
  )

  get = mock<KeyValueStore['get']>(
    async key => this.store.get(key) ?? null,
  )

  del = mock<KeyValueStore['del']>(
    async (key) => {
      const existed = this.store.delete(key)
      this.clearExpiry(key)
      return existed ? 1 : 0
    },
  )

  expire = mock<KeyValueStore['expire']>(
    async (key, ttl) => {
      if (!this.store.has(key))
        return 0
      this.setExpiry(key, ttl)
      return 1
    },
  )

  incr = mock<KeyValueStore['incr']>(
    async (key) => {
      const next = Number(this.store.get(key) ?? '0') + 1
      this.store.set(key, String(next))
      return next
    },
  )

  private setExpiry(key: string, ttl: number) {
    this.clearExpiry(key)
    const timer = setTimeout(() => {
      this.store.delete(key)
      this.timers.delete(key)
    }, ttl * 1000)
    this.timers.set(key, timer)
  }

  private clearExpiry(key: string) {
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
  }
}

export const cacheMock = new CacheMock()
