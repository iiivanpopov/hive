import type { factory } from '@/lib/factory'

export interface KeyValueStore {
  setex: (key: string, ttl: number, value: string) => Promise<void | 'OK'>
  get: (key: string) => Promise<string | null>
  del: (key: string) => Promise<void | number>
  expire: (key: string, ttl: number) => Promise<void | number>
  incr: (key: string) => Promise<number>
}

export interface BaseRouter {
  basePath: string
  init: () => ReturnType<typeof factory.createApp>
}
