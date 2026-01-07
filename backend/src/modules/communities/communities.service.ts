import { and, eq } from 'drizzle-orm'

import type { User } from '@/db/tables/users'
import type { DrizzleDatabase } from '@/db/utils'

import { communities } from '@/db/tables/communities'
import { communityMembers } from '@/db/tables/community-members'
import { ApiException } from '@/lib/api-exception'

import type { CreateCommunityBody } from './schema/create-community.schema'
import type { DeleteCommunityParam } from './schema/delete-community.schema'
import type { GetCommunityParams } from './schema/get-community.schema'
import type { LeaveCommunityParam } from './schema/leave-community.schema'
import type { UpdateCommunityBody, UpdateCommunityParam } from './schema/update-community.schema'

export class CommunitiesService {
  constructor(
    private readonly db: DrizzleDatabase,
  ) { }

  async getJoinedCommunities(user: User) {
    const communities = await this.db.query.communities.findMany({
      where: {
        members: {
          userId: user.id,
        },
      },
    })

    return communities
  }

  async leaveCommunity(params: LeaveCommunityParam, user: User) {
    const [community] = await this.db
      .delete(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, params.communityId),
          eq(communityMembers.userId, user.id),
        ),
      )
      .returning()

    return community
  }

  async updateCommunity(params: UpdateCommunityParam, data: UpdateCommunityBody) {
    const [updatedCommunity] = await this.db
      .update(communities)
      .set({ name: data.name })
      .where(eq(communities.id, params.communityId))
      .returning()

    return updatedCommunity
  }

  async deleteCommunity(params: DeleteCommunityParam) {
    const [deletedCommunity] = await this.db
      .delete(communities)
      .where(eq(communities.id, params.communityId))
      .returning()

    return deletedCommunity
  }

  async createCommunity(body: CreateCommunityBody, user: User) {
    const communityExists = await this.db.query.communities.findFirst({
      where: {
        name: body.name,
      },
    })

    if (communityExists)
      throw ApiException.BadRequest('Community with this name already exists', 'COMMUNITY_EXISTS')

    const community = await this.db.transaction(async (tx) => {
      const [community] = await tx
        .insert(communities)
        .values({
          ownerId: user.id,
          name: body.name,
        })
        .returning()

      await tx
        .insert(communityMembers)
        .values({
          communityId: community.id,
          userId: user.id,
          role: 'owner',
        })

      return community
    })

    return community
  }

  async getCommunity(params: GetCommunityParams) {
    const community = await this.db.query.communities.findFirst({
      where: {
        id: params.communityId,
      },
    })

    return community!
  }
}
