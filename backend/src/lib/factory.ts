import { createFactory } from 'hono/factory'

import type { User } from '@/db/schema'

export interface Env {
  Bindings: undefined
  Variables: {
    user: User
  }
}

export const factory = createFactory<Env>()
