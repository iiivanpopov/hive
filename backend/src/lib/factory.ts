import { createFactory } from 'hono/factory'

import type { User } from '@/db/tables/users'

export interface Env {
  Bindings: undefined
  Variables: {
    user: User
  }
}

export const factory = createFactory<Env>()
