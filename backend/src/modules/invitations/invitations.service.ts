import { eq } from 'drizzle-orm'

import type { User } from '@/db/tables/users'
import type { DrizzleDatabase } from '@/db/utils'

import { communityMembers } from '@/db/tables/community-members'
import { invitations } from '@/db/tables/invitations'
import { ApiException } from '@/lib/api-exception'
import { generateInvitationId } from '@/lib/utils'

import type { CreateInvitationBody, CreateInvitationParam } from './schema/create-invitation.schema'
import type { DeleteInvitationParam } from './schema/delete-invitation.schema'
import type { JoinInvitationParam } from './schema/join-invitation.schema'

export class InvitationsService {
  constructor(
    private readonly db: DrizzleDatabase,
  ) { }

  async joinCommunityViaInvitation(params: JoinInvitationParam, user: User) {
    const invitation = await this.db.query.invitations.findFirst({
      where: {
        token: params.token,
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
        userId: user.id,
      },
    })
    if (membership)
      throw ApiException.BadRequest('You are already a member of this community', 'ALREADY_A_MEMBER')

    await this.db
      .insert(communityMembers)
      .values({
        communityId: invitation.community!.id,
        userId: user.id,
        role: 'member',
      })

    return invitation.community!
  }

  async revokeInvitation(params: DeleteInvitationParam) {
    const invitation = await this.db.query.invitations.findFirst({
      where: {
        id: params.invitationId,
      },
      with: {
        community: true,
      },
    })
    if (!invitation)
      throw ApiException.NotFound('Invitation not found', 'INVITATION_NOT_FOUND')

    const [deletedInvitation] = await this.db
      .delete(invitations)
      .where(eq(invitations.id, params.invitationId))
      .returning()

    return deletedInvitation
  }

  async createCommunityInvitation(params: CreateInvitationParam, data: CreateInvitationBody) {
    const [invitation] = await this.db
      .insert(invitations)
      .values({
        communityId: params.communityId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        token: generateInvitationId(),
      })
      .returning()

    return invitation
  }
}
