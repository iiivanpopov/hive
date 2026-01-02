import { defineRelations } from 'drizzle-orm'

import { channels } from './tables/channels'
import { communities } from './tables/communities'
import { communityMembers } from './tables/community-members'
import { invitations } from './tables/invitations'
import { messages } from './tables/messages'
import { users } from './tables/users'

export const relations = defineRelations({
  users,
  communities,
  communityMembers,
  invitations,
  channels,
  messages,
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
    invitations: r.many.invitations({
      from: r.communities.id,
      to: r.invitations.communityId,
    }),
    messages: r.many.messages({
      from: r.communities.id,
      to: r.messages.channelId,
    }),
    channels: r.many.channels({
      from: r.communities.id,
      to: r.channels.communityId,
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
    messages: r.many.messages({
      from: r.users.id,
      to: r.messages.userId,
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
  invitations: {
    community: r.one.communities({
      from: r.invitations.communityId,
      to: r.communities.id,
    }),
  },
}))
