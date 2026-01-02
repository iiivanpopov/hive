import { describeRoute, resolver } from 'hono-openapi'

import type { DrizzleDatabase } from '@/db/utils'
import type { BaseRouter } from '@/lib/base-router.interface'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'

import { factory } from '@/lib/factory'
import { sessionMiddleware, validator } from '@/middleware'

import { CommunityMembersService } from './community-members.service'
import { GetCommunityMembersParamsSchema, GetCommunityMembersResponseSchema } from './schema/get-community-members.schema'

export class CommunityMembersRouter implements BaseRouter {
  readonly basePath = '/'
  private readonly communityMembersService: CommunityMembersService

  constructor(
    private readonly db: DrizzleDatabase,
    private readonly sessionTokens: SessionTokenRepository,
  ) {
    this.communityMembersService = new CommunityMembersService(db)
  }

  init() {
    const app = factory
      .createApp()
      .basePath(this.basePath)
      .use(sessionMiddleware(this.db, this.sessionTokens))
      .get(
        '/communities/:id/members',
        describeRoute({
          tags: ['Community Members'],
          summary: 'Get community members',
          description: 'Retrieve a list of members for a specific community by its ID.',
          responses: {
            200: {
              description: 'List of community members retrieved successfully',
              content: {
                'application/json': {
                  schema: resolver(GetCommunityMembersResponseSchema),
                },
              },
            },
          },
        }),
        validator('param', GetCommunityMembersParamsSchema),
        async (c) => {
          const { id } = c.req.valid('param')

          const members = await this.communityMembersService.getCommunityMembers(id)

          return c.json({ members })
        },
      )

    return app
  }
}
