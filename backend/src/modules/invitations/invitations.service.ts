import { eq } from 'drizzle-orm'

import type { DrizzleDatabase } from '@/db/utils'

import { communityMembers } from '@/db/tables/community-members'
import { invitations } from '@/db/tables/invitations'
import { ApiException } from '@/lib/api-exception'
import { generateInvitationId } from '@/lib/utils'

import type { CreateInvitationBody } from './schema/create-invitation.schema'

export class InvitationsService {
  constructor(
    private readonly db: DrizzleDatabase,
  ) {}

  async joinCommunityViaInvitation(token: string, userId: number) {
    const invitation = await this.db.query.invitations.findFirst({
      where: {
        token,
        OR: [
          { expiresAt: { gt: new Date() } },
          { expiresAt: { isNull: true } },
        ],
      },
      with: {
        community: true,
      },
    })
    if (!invitation)
      throw ApiException.NotFound('Invitation not found or expired', 'INVITATION_NOT_FOUND')

    const membership = await this.db.query.communityMembers.findFirst({
      where: {
        communityId: invitation.community!.id,
        userId,
      },
    })
    if (membership)
      throw ApiException.BadRequest('You are already a member of this community', 'ALREADY_A_MEMBER')

    await this.db
      .insert(communityMembers)
      .values({
        communityId: invitation.community!.id,
        userId,
        role: 'member',
      })
  }

  async revokeInvitation(invitationId: number, userId: number) {
    const invitation = await this.db.query.invitations.findFirst({
      where: {
        id: invitationId,
      },
      with: {
        community: true,
      },
    })
    if (!invitation)
      throw ApiException.NotFound('Invitation not found', 'INVITATION_NOT_FOUND')

    if (invitation.community!.ownerId !== userId)
      throw ApiException.Forbidden('You do not have permission to revoke this invitation', 'FORBIDDEN')

    const [newInvitation] = await this.db
      .delete(invitations)
      .where(eq(invitations.id, invitationId))
      .returning()

    return newInvitation
  }

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
