import { and, eq } from 'drizzle-orm'

import type { DrizzleDatabase } from '@/db/instance'

import { communities } from '@/db/tables/communities'
import { communityMembers } from '@/db/tables/community-members'
import { ApiException } from '@/lib/api-exception'

import type { CreateCommunityBody } from './schema/create-community.schema'
import type { UpdateCommunityBody } from './schema/update-community.schema'

export class CommunitiesService {
  constructor(
    private readonly db: DrizzleDatabase,
  ) {}

  async leaveCommunity(communityId: number, userId: number) {
    const community = await this.db.query.communities.findFirst({
      where: {
        id: communityId,
      },
    })
    if (!community)
      throw ApiException.NotFound('Community not found', 'COMMUNITY_NOT_FOUND')

    const membership = await this.db.query.communityMembers.findFirst({
      where: {
        communityId,
        userId,
      },
    })
    if (!membership)
      throw ApiException.BadRequest('You are not a member of this community', 'NOT_A_MEMBER')

    if (community.ownerId === userId)
      throw ApiException.BadRequest('Community owners cannot leave their own community', 'OWNER_CANNOT_LEAVE')

    await this.db
      .delete(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, userId),
        ),
      )
  }

  async updateCommunity(communityId: number, data: UpdateCommunityBody, userId: number) {
    const community = await this.db.query.communities.findFirst({
      where: {
        id: communityId,
      },
    })
    if (!community)
      throw ApiException.NotFound('Community not found', 'COMMUNITY_NOT_FOUND')

    if (community.ownerId !== userId)
      throw ApiException.Forbidden('You do not have permission to update this community', 'FORBIDDEN')
    const [updatedCommunity] = await this.db
      .update(communities)
      .set({ name: data.name })
      .where(eq(communities.id, communityId))
      .returning()

    return updatedCommunity
  }

  async deleteCommunity(communityId: number, userId: number) {
    const community = await this.db.query.communities.findFirst({
      where: {
        id: communityId,
      },
    })

    if (!community)
      throw ApiException.NotFound('Community not found', 'COMMUNITY_NOT_FOUND')

    if (community.ownerId !== userId)
      throw ApiException.Forbidden('You do not have permission to delete this community', 'FORBIDDEN')

    await this.db
      .delete(communities)
      .where(eq(communities.id, communityId))
  }

  async createCommunity(body: CreateCommunityBody, ownerId: number) {
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
          ownerId,
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
