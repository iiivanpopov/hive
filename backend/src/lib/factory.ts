import type { User } from '@/db/schema'
import { createFactory } from 'hono/factory'

export interface Env {
  Bindings: undefined
  Variables: {
    user: User
  }
}

export const factory = createFactory<Env>()
