import { describeRoute, resolver } from 'hono-openapi'

import type { DrizzleDatabase } from '@/db/instance'
import type { BaseRouter } from '@/lib/base-router.interface'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'

import { factory } from '@/lib/factory'
import { sessionMiddleware, validator } from '@/middleware'

import { CommunitiesService } from './communities.service'
import { CreateCommunityBodySchema, CreateCommunityResponseSchema } from './schema/create-community.schema'

export class CommunitiesRouter implements BaseRouter {
  basePath = '/communities'
  communitiesService: CommunitiesService

  constructor(
    private readonly db: DrizzleDatabase,
    private readonly sessionTokens: SessionTokenRepository,
  ) {
    this.communitiesService = new CommunitiesService(this.db)
  }

  init() {
    const app = factory
      .createApp()
      .basePath(this.basePath)
      .use(sessionMiddleware(this.db, this.sessionTokens))
      .post(
        '/',
        describeRoute({
          tags: ['Communities'],
          summary: 'Create a new community',
          description: 'Create a new community with the specified name.',
          responses: {
            201: {
              description: 'Community created successfully',
              content: {
                'application/json': {
                  schema: resolver(CreateCommunityResponseSchema),
                },
              },
            },
          },
        }),
        validator('json', CreateCommunityBodySchema),
        async (c) => {
          const body = c.req.valid('json')
          const user = c.get('user')

          const joinId = await this.communitiesService.createCommunity(body, user.id)

          return c.json({ joinId }, 201)
        },
      )
      .delete(
        '/:id',
        async (c) => {
          return c.body(null, 204)
        },
      )
      .post(
        '/join/:id',
        async (c) => {
          return c.body(null, 204)
        },
      )
      .post(
        '/leave/:id',
        async (c) => {
          return c.body(null, 204)
        },
      )

    return app
  }
}
