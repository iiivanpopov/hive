import { defineRelations } from 'drizzle-orm'

import { communities, users } from './schema'

export const relations = defineRelations({
  users,
  communities,
}, r => ({
  communities: {
    owner: r.one.users({
      from: r.communities.ownerId,
      to: r.users.id,
    }),
  },
  users: {
    ownedCommunities: r.many.communities({
      from: r.users.id,
      to: r.communities.ownerId,
    }),
  },
}))
