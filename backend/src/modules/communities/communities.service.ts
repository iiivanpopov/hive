import { eq } from 'drizzle-orm'

import type { DrizzleDatabase } from '@/db/instance'

import { communities, communityMembers } from '@/db/schema'
import { ApiException } from '@/lib/api-exception'
import { generateJoinId } from '@/lib/utils'

import type { CreateCommunityBody } from './schema/create-community.schema'

export class CommunitiesService {
  constructor(
    private readonly db: DrizzleDatabase,
  ) {}

  async deleteCommunity(communityId: number, userId: number) {
    const [community] = await this.db.query.communities.findMany({
      where: {
        id: communityId,
      },
    })

    if (!community)
      throw ApiException.NotFound('Community not found', 'COMMUNITY_NOT_FOUND')

    if (community.ownerId !== userId)
      throw ApiException.Forbidden('You do not have permission to delete this community', 'FORBIDDEN')

    await this.db.transaction(async (tx) => {
      await tx
        .delete(communityMembers)
        .where(eq(communityMembers.communityId, communityId))

      await tx
        .delete(communities)
        .where(eq(communities.id, communityId))
    })
  }

  async createCommunity(body: CreateCommunityBody, ownerId: number) {
    const [communityExists] = await this.db.query.communities.findMany({
      where: {
        name: body.name,
      },
    })

    if (communityExists)
      throw ApiException.BadRequest('Community with this name already exists', 'COMMUNITY_EXISTS')

    const community = await this.db.transaction(async (tx) => {
      const joinId = generateJoinId()

      const [community] = await tx
        .insert(communities)
        .values({
          ownerId,
          joinId,
          name: body.name,
        })
        .returning()

      await tx
        .insert(communityMembers)
        .values({
          communityId: community.id,
          userId: ownerId,
          role: 'owner',
        })

      return community
    })

    return community
  }
}
