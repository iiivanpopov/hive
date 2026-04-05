import type { DrizzleDatabase } from '@/db/utils'

import { ApiException } from '@/lib/api-exception'
import { factory } from '@/lib/factory'

export function ensureChannelMember(db: DrizzleDatabase) {
  return factory.createMiddleware(async (c, next) => {
    const user = c.get('user')
    const channelId = Number(c.req.query('channelId'))

    if (Number.isNaN(channelId))
      throw ApiException.BadRequest('Invalid channel ID', 'INVALID_CHANNEL_ID')

    const membership = await db.query.communityMembers.findFirst({
      where: {
        community: {
          channels: {
            id: channelId,
          },
        },
        userId: user.id,
      },
    })

    if (!membership)
      throw ApiException.NotFound('Not a community member', 'NOT_A_MEMBER')

    await next()
  })
}
