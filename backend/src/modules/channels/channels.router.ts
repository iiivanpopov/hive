import { describeRoute, resolver } from 'hono-openapi'

import type { DrizzleDatabase } from '@/db/utils'
import type { BaseRouter } from '@/lib/base-router.interface'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'

import { factory } from '@/lib/factory'
import { sessionMiddleware, validator } from '@/middleware'

import { ChannelsService } from './channels.service'
import { CreateChannelBodySchema, CreateChannelParamsSchema, CreateChannelResponseSchema } from './schema/create-channel.schema'
import { DeleteChannelParamsSchema } from './schema/delete-channel.schema'
import { GetChannelsInCommunityParamsSchema, GetChannelsInCommunityResponseSchema } from './schema/get-channels-in-community.schema'
import { UpdateChannelBodySchema, UpdateChannelParamsSchema } from './schema/update-channel.schema'

export class ChannelsRouter implements BaseRouter {
  readonly basePath = '/'
  private readonly channelsService: ChannelsService

  constructor(
    private readonly db: DrizzleDatabase,
    private readonly sessionTokens: SessionTokenRepository,
  ) {
    this.channelsService = new ChannelsService(db)
  }

  init() {
    const app = factory
      .createApp()
      .basePath(this.basePath)
      .post(
        '/communities/:id/channels',
        describeRoute({
          tags: ['Channels'],
          summary: 'Create a new channel in a community',
          description: 'Create a new channel within the specified community.',
          responses: {
            201: {
              description: 'Channel created successfully',
              content: {
                'application/json': {
                  schema: resolver(CreateChannelResponseSchema),
                },
              },
            },
          },
        }),
        sessionMiddleware(this.db, this.sessionTokens),
        validator('param', CreateChannelParamsSchema),
        validator('json', CreateChannelBodySchema),
        async (c) => {
          const user = c.get('user')
          const { id } = c.req.valid('param')
          const body = c.req.valid('json')

          const channel = await this.channelsService.createChannel(id, body, user.id)

          return c.json({ channel }, 201)
        },
      )
      .get(
        '/communities/:id/channels',
        describeRoute({
          tags: ['Channels'],
          summary: 'Get channels in a community',
          description: 'Retrieve a list of channels within the specified community.',
          responses: {
            200: {
              description: 'List of channels retrieved successfully',
              content: {
                'application/json': {
                  schema: resolver(GetChannelsInCommunityResponseSchema),
                },
              },
            },
          },
        }),
        sessionMiddleware(this.db, this.sessionTokens),
        validator('param', GetChannelsInCommunityParamsSchema),
        async (c) => {
          const { id } = c.req.valid('param')
          const user = c.get('user')

          const channels = await this.channelsService.getChannelsByCommunityId(id, user.id)

          return c.json({ channels })
        },
      )
      .delete(
        '/channels/:id',
        describeRoute({
          tags: ['Channels'],
          summary: 'Delete a channel',
          description: 'Delete the specified channel.',
          responses: {
            204: {
              description: 'Channel deleted successfully',
            },
          },
        }),
        sessionMiddleware(this.db, this.sessionTokens),
        validator('param', DeleteChannelParamsSchema),
        async (c) => {
          const user = c.get('user')
          const { id } = c.req.valid('param')

          await this.channelsService.deleteChannel(id, user.id)

          return c.body(null, 204)
        },
      )
      .patch(
        '/channels/:id',
        describeRoute({
          tags: ['Channels'],
          summary: 'Update a channel',
          description: 'Update the specified channel.',
          responses: {
            204: {
              description: 'Channel updated successfully',
            },
          },
        }),
        sessionMiddleware(this.db, this.sessionTokens),
        validator('param', UpdateChannelParamsSchema),
        validator('json', UpdateChannelBodySchema),
        async (c) => {
          const user = c.get('user')
          const body = c.req.valid('json')
          const { id } = c.req.valid('param')

          await this.channelsService.updateChannel(id, body, user.id)

          return c.body(null, 204)
        },
      )

    return app
  }
}
