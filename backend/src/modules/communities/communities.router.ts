import { describeRoute, resolver } from 'hono-openapi'

import type { DrizzleDatabase } from '@/db/instance'
import type { BaseRouter } from '@/lib/base-router.interface'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'

import { factory } from '@/lib/factory'
import { sessionMiddleware, validator } from '@/middleware'

import { CommunitiesService } from './communities.service'
import { CreateCommunityBodySchema, CreateCommunityResponseSchema } from './schema/create-community.schema'
import { DeleteCommunityParamSchema } from './schema/delete-community.schema'
import { LeaveCommunityParamSchema } from './schema/leave-community.schema'
import { UpdateCommunityBodySchema, UpdateCommunityParamSchema, UpdateCommunityResponseSchema } from './schema/update-community.schema'

export class CommunitiesRouter implements BaseRouter {
  readonly basePath = '/communities'
  private readonly communitiesService: CommunitiesService

  constructor(
    private readonly db: DrizzleDatabase,
    private readonly sessionTokens: SessionTokenRepository,
  ) {
    this.communitiesService = new CommunitiesService(db)
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

          const community = await this.communitiesService.createCommunity(body, user.id)

          return c.json({ community }, 201)
        },
      )
      .delete(
        '/:id',
        describeRoute({
          tags: ['Communities'],
          summary: 'Delete a community',
          description: 'Delete a community by its ID.',
          responses: {
            204: {
              description: 'Community deleted successfully',
            },
          },
        }),
        validator('param', DeleteCommunityParamSchema),
        async (c) => {
          const params = c.req.valid('param')
          const user = c.get('user')

          await this.communitiesService.deleteCommunity(params.id, user.id)

          return c.body(null, 204)
        },
      )
      .patch(
        '/:id',
        describeRoute({
          tags: ['Communities'],
          summary: 'Update a community',
          description: 'Update a community by its ID.',
          responses: {
            200: {
              description: 'Community updated successfully',
              content: {
                'application/json': {
                  schema: resolver(UpdateCommunityResponseSchema),
                },
              },
            },
          },
        }),
        validator('param', UpdateCommunityParamSchema),
        validator('json', UpdateCommunityBodySchema),
        async (c) => {
          const { id } = c.req.valid('param')
          const body = c.req.valid('json')
          const user = c.get('user')

          const community = await this.communitiesService.updateCommunity(id, body, user.id)

          return c.json({ community })
        },
      )
      .post(
        '/leave/:id',
        describeRoute({
          tags: ['Communities'],
          summary: 'Leave a community',
          description: 'Leave a community by its ID.',
          responses: {
            204: {
              description: 'Left community successfully',
            },
          },
        }),
        validator('param', LeaveCommunityParamSchema),
        async (c) => {
          const params = c.req.valid('param')
          const user = c.get('user')

          await this.communitiesService.leaveCommunity(params.id, user.id)

          return c.body(null, 204)
        },
      )

    return app
  }
}
