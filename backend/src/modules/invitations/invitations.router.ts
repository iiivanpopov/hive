import { describeRoute, resolver } from 'hono-openapi'

import type { DrizzleDatabase } from '@/db/utils'
import type { BaseRouter } from '@/lib/base-router.interface'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'

import { factory } from '@/lib/factory'
import { sessionMiddleware, validator } from '@/middleware'

import { InvitationsService } from './invitations.service'
import { CreateInvitationBodySchema, CreateInvitationParamsSchema, CreateInvitationResponseSchema } from './schema/create-invitation.schema'
import { DeleteInvitationParamsSchema } from './schema/delete-invitation.schema'
import { JoinInvitationParamsSchema, JoinInvitationSchema } from './schema/join-invitation.schema'

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
        '/communities/:id/invitations',
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
        sessionMiddleware(this.db, this.sessionTokens),
        validator('param', CreateInvitationParamsSchema),
        validator('json', CreateInvitationBodySchema),
        async (c) => {
          const { id } = c.req.valid('param')
          const body = c.req.valid('json')
          const user = c.get('user')

          const invitation = await this.invitationsService.createCommunityInvitation(id, body, user.id)

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
            204: {
              description: 'Joined community successfully',
            },
          },
        }),
        sessionMiddleware(this.db, this.sessionTokens),
        validator('param', JoinInvitationParamsSchema),
        async (c) => {
          const { token } = c.req.valid('param')
          const user = c.get('user')

          await this.invitationsService.joinCommunityViaInvitation(token, user.id)

          return c.body(null, 204)
        },
      )
      .delete(
        '/invitations/:id',
        describeRoute({
          tags: ['Invitations'],
          summary: 'Revoke an invitation',
          description: 'Revoke an existing community invitation.',
          responses: {
            200: {
              description: 'Invitation revoked successfully',
              content: {
                'application/json': {
                  schema: resolver(JoinInvitationSchema),
                },
              },
            },
          },
        }),
        sessionMiddleware(this.db, this.sessionTokens),
        validator('param', DeleteInvitationParamsSchema),
        async (c) => {
          const { id } = c.req.valid('param')
          const user = c.get('user')

          const invitation = await this.invitationsService.revokeInvitation(id, user.id)

          return c.json({ invitation }, 200)
        },
      )

    return app
  }
}
