import { describeRoute, resolver } from 'hono-openapi'

import type { DrizzleDatabase } from '@/db/utils'
import type { BaseRouter } from '@/lib/base-router.interface'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'

import { factory } from '@/lib/factory'
import { sessionMiddleware, validator } from '@/middleware'

import { CommunitiesService } from './communities.service'
import { CreateCommunityBodySchema, CreateCommunityResponseSchema } from './schema/create-community.schema'
import { DeleteCommunityParamsSchema } from './schema/delete-community.schema'
import { GetJoinedCommunitiesResponseSchema } from './schema/get-joined-communities.schema'
import { LeaveCommunityParamsSchema } from './schema/leave-community.schema'
import { UpdateCommunityBodySchema, UpdateCommunityParamsSchema, UpdateCommunityResponseSchema } from './schema/update-community.schema'

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
      .get(
        '/joined',
        describeRoute({
          tags: ['Communities'],
          summary: 'Get joined communities',
          description: 'Retrieve a list of communities that the authenticated user has joined.',
          responses: {
            200: {
              description: 'List of joined communities retrieved successfully',
              content: {
                'application/json': {
                  schema: resolver(GetJoinedCommunitiesResponseSchema),
                },
              },
            },
          },
        }),
        async (c) => {
          const user = c.get('user')

          const communities = await this.communitiesService.getJoinedCommunities(user.id)

          return c.json({ communities })
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
        validator('param', LeaveCommunityParamsSchema),
        async (c) => {
          const params = c.req.valid('param')
          const user = c.get('user')

          await this.communitiesService.leaveCommunity(params.id, user.id)

          return c.body(null, 204)
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
        validator('param', DeleteCommunityParamsSchema),
        async (c) => {
          const { id } = c.req.valid('param')
          const user = c.get('user')

          await this.communitiesService.deleteCommunity(id, user.id)

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
        validator('param', UpdateCommunityParamsSchema),
        validator('json', UpdateCommunityBodySchema),
        async (c) => {
          const { id } = c.req.valid('param')
          const body = c.req.valid('json')
          const user = c.get('user')

          const community = await this.communitiesService.updateCommunity(id, body, user.id)

          return c.json({ community })
        },
      )

    return app
  }
}
