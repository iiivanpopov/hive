import { describeRoute, resolver } from 'hono-openapi'

import type { DrizzleDatabase } from '@/db/instance'
import type { BaseRouter } from '@/lib/base-router.interface'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'

import { factory } from '@/lib/factory'
import { sessionMiddleware, validator } from '@/middleware'

import { InvitationsService } from './invitations.service'
import { CreateInvitationBodySchema, CreateInvitationParamSchema, InvitationResponseSchema } from './schema/create-invitation.schema'

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
        sessionMiddleware(this.db, this.sessionTokens),
        describeRoute({
          tags: ['Invitations'],
          summary: 'Create a community invitation',
          description: 'Create an invitation for a community.',
          responses: {
            201: {
              description: 'Invitation created successfully',
              content: {
                'application/json': {
                  schema: resolver(InvitationResponseSchema),
                },
              },
            },
          },
        }),
        validator('param', CreateInvitationParamSchema),
        validator('json', CreateInvitationBodySchema),
        async (c) => {
          const { communityId } = c.req.valid('param')
          const body = c.req.valid('json')
          const user = c.get('user')

          const invitation = await this.invitationsService.createCommunityInvitation(communityId, body, user.id)

          return c.json({ invitation }, 201)
        },
      )

    return app
  }
}
