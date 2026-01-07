import { describeRoute, resolver } from 'hono-openapi'

import type { DrizzleDatabase } from '@/db/utils'
import type { BaseRouter } from '@/lib/base-router.interface'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'

import { factory } from '@/lib/factory'
import { session, validator } from '@/middleware'
import { onlyMember } from '@/middleware/only-member.middleware'
import { role } from '@/middleware/role.middleware'

import { InvitationsService } from './invitations.service'
import { CreateInvitationBodySchema, CreateInvitationParamsSchema, CreateInvitationResponseSchema } from './schema/create-invitation.schema'
import { DeleteInvitationParamsSchema, DeleteInvitationResponseSchema } from './schema/delete-invitation.schema'
import { JoinInvitationParamsSchema, JoinInvitationResponseSchema } from './schema/join-invitation.schema'

export class InvitationsRouter implements BaseRouter {
  readonly basePath = '/'
  private readonly invitationsService: InvitationsService

  constructor(
    private readonly db: DrizzleDatabase,
    private readonly sessionTokens: SessionTokenRepository,
  ) {
    this.invitationsService = new InvitationsService(db)
  }

  init() {
    const app = factory
      .createApp()
      .basePath(this.basePath)
      .post(
        '/communities/:communityId/invitations',
        describeRoute({
          tags: ['Invitations'],
          summary: 'Create a community invitation',
          description: 'Create an invitation for a community.',
          responses: {
            201: {
              description: 'Invitation created successfully',
              content: {
                'application/json': {
                  schema: resolver(CreateInvitationResponseSchema),
                },
              },
            },
          },
        }),
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'communityId' }),
        role(['owner']),
        validator('param', CreateInvitationParamsSchema),
        validator('json', CreateInvitationBodySchema),
        async (c) => {
          const params = c.req.valid('param')
          const body = c.req.valid('json')

          const invitation = await this.invitationsService.createCommunityInvitation(params, body)

          return c.json({ invitation }, 201)
        },
      )
      .post(
        '/communities/join/:token',
        describeRoute({
          tags: ['Invitations'],
          summary: 'Join a community via invitation',
          description: 'Join a community using an invitation ID.',
          responses: {
            200: {
              description: 'Joined community successfully',
              content: {
                'application/json': {
                  schema: resolver(JoinInvitationResponseSchema),
                },
              },
            },
          },
        }),
        session(this.db, this.sessionTokens),
        validator('param', JoinInvitationParamsSchema),
        async (c) => {
          const params = c.req.valid('param')
          const user = c.get('user')

          const community = await this.invitationsService.joinCommunityViaInvitation(params, user)

          return c.json({ community })
        },
      )
      .delete(
        '/invitations/:invitationId',
        describeRoute({
          tags: ['Invitations'],
          summary: 'Revoke an invitation',
          description: 'Revoke an existing community invitation.',
          responses: {
            200: {
              description: 'Invitation revoked successfully',
              content: {
                'application/json': {
                  schema: resolver(DeleteInvitationResponseSchema),
                },
              },
            },
          },
        }),
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'invitationId' }),
        role(['owner']),
        validator('param', DeleteInvitationParamsSchema),
        async (c) => {
          const params = c.req.valid('param')

          const invitation = await this.invitationsService.revokeInvitation(params)

          return c.json({ invitation }, 200)
        },
      )

    return app
  }
}
