import type { DrizzleDatabase } from '@/db/instance'

import { invitations } from '@/db/schema'
import { ApiException } from '@/lib/api-exception'
import { generateInvitationId } from '@/lib/utils'

import type { CreateInvitationBody } from './schema/create-invitation.schema'

export class InvitationsService {
  constructor(
    private readonly db: DrizzleDatabase,
  ) {}

  async createCommunityInvitation(communityId: number, data: CreateInvitationBody, userId: number) {
    const [community] = await this.db.query.communities.findMany({
      where: {
        id: communityId,
      },
    })

    if (!community)
      throw ApiException.NotFound('Community not found', 'COMMUNITY_NOT_FOUND')

    const [membership] = await this.db.query.communityMembers.findMany({
      where: {
        communityId,
        userId,
      },
    })

    if (membership?.role !== 'owner')
      throw ApiException.Forbidden('You do not have permission to create an invitation for this community', 'FORBIDDEN')

    const link = `https://${Bun.env.FRONTEND_URL}/invite/${generateInvitationId()}`

    const [invitation] = await this.db
      .insert(invitations)
      .values({
        communityId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        link,
      })
      .returning()

    return invitation
  }
}
