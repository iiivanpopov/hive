import type { DrizzleDatabase } from '@/db/utils'

import { toUserDto } from '@/db/tables/users/users.utils'
import { ApiException } from '@/lib/api-exception'

export class CommunityMembersService {
  constructor(
    private readonly db: DrizzleDatabase,
  ) {}

  async getCommunityMembers(communityId: number) {
    const community = await this.db.query.communities.findFirst({
      where: {
        id: communityId,
      },
    })
    if (!community)
      throw ApiException.NotFound('Community not found', 'COMMUNITY_NOT_FOUND')

    const members = await this.db.query.communityMembers.findMany({
      where: {
        communityId,
      },
      with: {
        user: true,
      },
    })

    return members.map(member => toUserDto(member.user!))
  }
}
