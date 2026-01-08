import { describeRoute, resolver } from 'hono-openapi'

import type { DrizzleDatabase } from '@/db/utils'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'
import type { BaseRouter } from '@/types/interfaces'

import { factory } from '@/lib/factory'
import { session, validator } from '@/middleware'
import { onlyMember } from '@/middleware/only-member.middleware'
import { role } from '@/middleware/role.middleware'

import { ChannelsService } from './channels.service'
import { CreateChannelBodySchema, CreateChannelParamsSchema, CreateChannelResponseSchema } from './schema/create-channel.schema'
import { DeleteChannelParamsSchema, DeletedChannelResponseSchema } from './schema/delete-channel.schema'
import { GetChannelParamsSchema, GetChannelResponseSchema } from './schema/get-channel.schema'
import { GetChannelsInCommunityParamsSchema, GetChannelsInCommunityResponseSchema } from './schema/get-channels-in-community.schema'
import { UpdateChannelBodySchema, UpdateChannelParamsSchema, UpdatedChannelResponseSchema } from './schema/update-channel.schema'

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
      .get(
        '/channels/:channelId',
        describeRoute({
          tags: ['Channels'],
          summary: 'Get channel by ID',
          description: 'Retrieve a channel by its unique identifier.',
          responses: {
            200: {
              description: 'Channel retrieved successfully',
              content: {
                'application/json': {
                  schema: resolver(GetChannelResponseSchema),
                },
              },
            },
          },
        }),
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'channelId' }),
        role('all'),
        validator('param', GetChannelParamsSchema),
        async (c) => {
          const params = c.req.valid('param')

          const channel = await this.channelsService.getChannelById(params)

          return c.json({ channel })
        },
      )
      .post(
        '/communities/:communityId/channels',
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
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'communityId' }),
        role(['owner']),
        validator('param', CreateChannelParamsSchema),
        validator('json', CreateChannelBodySchema),
        async (c) => {
          const params = c.req.valid('param')
          const body = c.req.valid('json')

          const channel = await this.channelsService.createChannel(params, body)

          return c.json({ channel }, 201)
        },
      )
      .get(
        '/communities/:communityId/channels',
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
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'communityId' }),
        role('all'),
        validator('param', GetChannelsInCommunityParamsSchema),
        async (c) => {
          const params = c.req.valid('param')

          const channels = await this.channelsService.getChannelsByCommunityId(params)

          return c.json({ channels })
        },
      )
      .delete(
        '/channels/:channelId',
        describeRoute({
          tags: ['Channels'],
          summary: 'Delete a channel',
          description: 'Delete the specified channel.',
          responses: {
            200: {
              description: 'Channel deleted successfully',
              content: {
                'application/json': {
                  schema: resolver(DeletedChannelResponseSchema),
                },
              },
            },
          },
        }),
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'channelId' }),
        role(['owner']),
        validator('param', DeleteChannelParamsSchema),
        async (c) => {
          const params = c.req.valid('param')

          const channel = await this.channelsService.deleteChannel(params)

          return c.json({ channel })
        },
      )
      .patch(
        '/channels/:channelId',
        describeRoute({
          tags: ['Channels'],
          summary: 'Update a channel',
          description: 'Update the specified channel.',
          responses: {
            204: {
              description: 'Channel updated successfully',
              content: {
                'application/json': {
                  schema: resolver(UpdatedChannelResponseSchema),
                },
              },
            },
          },
        }),
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'channelId' }),
        role(['owner']),
        validator('param', UpdateChannelParamsSchema),
        validator('json', UpdateChannelBodySchema),
        async (c) => {
          const body = c.req.valid('json')
          const params = c.req.valid('param')

          const channel = await this.channelsService.updateChannel(params, body)

          return c.json({ channel })
        },
      )

    return app
  }
}
