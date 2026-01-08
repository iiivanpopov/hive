import { describeRoute, resolver } from 'hono-openapi'

import type { DrizzleDatabase } from '@/db/utils'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'
import type { BaseRouter } from '@/types/interfaces'

import { factory } from '@/lib/factory'
import { session, validator } from '@/middleware'
import { onlyMember } from '@/middleware/only-member.middleware'
import { role } from '@/middleware/role.middleware'

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
      .get(
        '/communities/:communityId/members',
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
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'communityId' }),
        role('all'),
        validator('param', GetCommunityMembersParamsSchema),
        async (c) => {
          const params = c.req.valid('param')

          const members = await this.communityMembersService.getCommunityMembers(params)

          return c.json({ members })
        },
      )

    return app
  }
}
