import type { DrizzleDatabase } from '@/db/instance'

import { invitations } from '@/db/tables/invitations'
import { ApiException } from '@/lib/api-exception'
import { generateInvitationId } from '@/lib/utils'

import type { CreateInvitationBody } from './schema/create-invitation.schema'

export class InvitationsService {
  constructor(
    private readonly db: DrizzleDatabase,
  ) {}

  async createCommunityInvitation(communityId: number, data: CreateInvitationBody, userId: number) {
    const community = await this.db.query.communities.findFirst({
      where: {
        id: communityId,
        ownerId: userId,
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

    if (membership.role !== 'owner')
      throw ApiException.Forbidden('You do not have permission to create an invitation for this community', 'FORBIDDEN')

    const [invitation] = await this.db
      .insert(invitations)
      .values({
        communityId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        token: generateInvitationId(),
      })
      .returning()

    return invitation
  }
}
