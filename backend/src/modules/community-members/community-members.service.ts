import type { DrizzleDatabase } from '@/db/utils'

import { toUserDto } from '@/db/tables/users/users.utils'

import type { GetCommunityMembersParam } from './schema/get-community-members.schema'

export class CommunityMembersService {
  constructor(
    private readonly db: DrizzleDatabase,
  ) { }

  async getCommunityMembers(params: GetCommunityMembersParam) {
    const members = await this.db.query.communityMembers.findMany({
      where: {
        communityId: params.communityId,
      },
      with: {
        user: true,
      },
    })

    return members.map(member => toUserDto(member.user!))
  }
}
