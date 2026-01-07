import { describeRoute, resolver } from 'hono-openapi'

import type { DrizzleDatabase } from '@/db/utils'
import type { BaseRouter } from '@/lib/base-router.interface'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'

import { factory } from '@/lib/factory'
import { session, validator } from '@/middleware'
import { onlyMember } from '@/middleware/only-member.middleware'
import { role } from '@/middleware/role.middleware'

import { CommunitiesService } from './communities.service'
import { CreateCommunityBodySchema, CreateCommunityResponseSchema } from './schema/create-community.schema'
import { DeleteCommunityParamsSchema, DeleteCommunityResponseSchema } from './schema/delete-community.schema'
import { GetCommunityParamsSchema, GetCommunityResponseSchema } from './schema/get-community.schema'
import { GetJoinedCommunitiesResponseSchema } from './schema/get-joined-communities.schema'
import { LeaveCommunityParamsSchema, LeaveCommunityResponseSchema } from './schema/leave-community.schema'
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
        session(this.db, this.sessionTokens),
        validator('json', CreateCommunityBodySchema),
        async (c) => {
          const body = c.req.valid('json')
          const user = c.get('user')

          const community = await this.communitiesService.createCommunity(body, user)

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
        session(this.db, this.sessionTokens),
        async (c) => {
          const user = c.get('user')

          const communities = await this.communitiesService.getJoinedCommunities(user)

          return c.json({ communities })
        },
      )
      .post(
        '/leave/:communityId',
        describeRoute({
          tags: ['Communities'],
          summary: 'Leave a community',
          description: 'Leave a community by its ID.',
          responses: {
            200: {
              description: 'Left community successfully',
              content: {
                'application/json': {
                  schema: resolver(LeaveCommunityResponseSchema),
                },
              },
            },
          },
        }),
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'communityId' }),
        role(['member']),
        validator('param', LeaveCommunityParamsSchema),
        async (c) => {
          const params = c.req.valid('param')
          const user = c.get('user')

          const community = await this.communitiesService.leaveCommunity(params, user)

          return c.json({ community })
        },
      )
      .get(
        '/:communityId',
        describeRoute({
          tags: ['Communities'],
          summary: 'Get community by ID',
          description: 'Retrieve a community by its ID.',
          responses: {
            200: {
              description: 'Community retrieved successfully',
              content: {
                'application/json': {
                  schema: resolver(GetCommunityResponseSchema),
                },
              },
            },
          },
        }),
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'communityId' }),
        role('all'),
        validator('param', GetCommunityParamsSchema),
        async (c) => {
          const params = c.req.valid('param')

          const community = await this.communitiesService.getCommunity(params)

          return c.json({ community })
        },
      )
      .delete(
        '/:communityId',
        describeRoute({
          tags: ['Communities'],
          summary: 'Delete a community',
          description: 'Delete a community by its ID.',
          responses: {
            200: {
              description: 'Community deleted successfully',
              content: {
                'application/json': {
                  schema: resolver(DeleteCommunityResponseSchema),
                },
              },
            },
          },
        }),
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'communityId' }),
        role(['owner']),
        validator('param', DeleteCommunityParamsSchema),
        async (c) => {
          const params = c.req.valid('param')

          const community = await this.communitiesService.deleteCommunity(params)

          return c.json({ community })
        },
      )
      .patch(
        '/:communityId',
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
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'communityId' }),
        role(['owner']),
        validator('param', UpdateCommunityParamsSchema),
        validator('json', UpdateCommunityBodySchema),
        async (c) => {
          const params = c.req.valid('param')
          const body = c.req.valid('json')

          const community = await this.communitiesService.updateCommunity(params, body)

          return c.json({ community })
        },
      )

    return app
  }
}
