import { defineRelations } from 'drizzle-orm'

import {
  communities,
  communityMembers,
  invitations,
  users,
} from './schema'

export const relations = defineRelations({
  users,
  communities,
  communityMembers,
  communityJoinLinks: invitations,
}, r => ({
  communities: {
    owner: r.one.users({
      from: r.communities.ownerId,
      to: r.users.id,
    }),
    members: r.many.communityMembers({
      from: r.communities.id,
      to: r.communityMembers.communityId,
    }),
    invitations: r.many.communityJoinLinks({
      from: r.communities.id,
      to: r.communityJoinLinks.communityId,
    }),
  },
  users: {
    ownedCommunities: r.many.communities({
      from: r.users.id,
      to: r.communities.ownerId,
    }),
    communityMemberships: r.many.communityMembers({
      from: r.users.id,
      to: r.communityMembers.userId,
    }),
  },
  communityMembers: {
    community: r.one.communities({
      from: r.communityMembers.communityId,
      to: r.communities.id,
    }),
    user: r.one.users({
      from: r.communityMembers.userId,
      to: r.users.id,
    }),
  },
}))
