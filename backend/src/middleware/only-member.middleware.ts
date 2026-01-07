import type { CommunityMember } from '@/db/tables/community-members'
import type { DrizzleDatabase } from '@/db/utils'

import { ApiException } from '@/lib/api-exception'
import { factory } from '@/lib/factory'

interface OnlyMemberOptions {
  param: 'channelId' | 'communityId' | 'invitationId' | 'messageId'
}

export function onlyMember(db: DrizzleDatabase) {
  return ({ param }: OnlyMemberOptions) =>
    factory.createMiddleware(async (c, next) => {
      const user = c.get('user')

      let membership: CommunityMember | undefined

      if (param === 'communityId') {
        const communityId = Number(c.req.param('communityId'))
        if (Number.isNaN(communityId))
          throw ApiException.BadRequest('Invalid community ID', 'INVALID_COMMUNITY_ID')

        membership = await db.query.communityMembers.findFirst({
          where: {
            communityId,
            userId: user.id,
          },
        })
      }

      if (param === 'channelId') {
        const channelId = Number(c.req.param('channelId'))
        if (Number.isNaN(channelId))
          throw ApiException.BadRequest('Invalid channel ID', 'INVALID_CHANNEL_ID')

        membership = await db.query.communityMembers.findFirst({
          where: {
            community: {
              channels: {
                id: channelId,
              },
            },
            userId: user.id,
          },
        })
      }

      if (param === 'invitationId') {
        const invitationId = Number(c.req.param('invitationId'))
        if (Number.isNaN(invitationId))
          throw ApiException.BadRequest('Invalid invitation ID', 'INVALID_INVITATION_ID')

        membership = await db.query.communityMembers.findFirst({
          where: {
            community: {
              invitations: {
                id: invitationId,
              },
            },
            userId: user.id,
          },
        })
      }

      if (param === 'messageId') {
        const messageId = Number(c.req.param('messageId'))
        if (Number.isNaN(messageId))
          throw ApiException.BadRequest('Invalid message ID', 'INVALID_MESSAGE_ID')

        membership = await db.query.communityMembers.findFirst({
          where: {
            community: {
              channels: {
                messages: {
                  id: messageId,
                },
              },
            },
            userId: user.id,
          },
        })
      }

      if (!membership)
        throw ApiException.NotFound('Not a community member', 'NOT_A_MEMBER')

      c.set('membership', membership!)

      await next()
    })
}
