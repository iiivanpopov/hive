import { createFactory } from 'hono/factory'

import type { CommunityMember } from '@/db/tables/community-members'
import type { User } from '@/db/tables/users'

export interface Env {
  Bindings: undefined
  Variables: {
    user: User
    membership: CommunityMember
  }
}

export const factory = createFactory<Env>()
