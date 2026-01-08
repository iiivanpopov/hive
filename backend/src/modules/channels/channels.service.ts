import { eq } from 'drizzle-orm'

import type { DrizzleDatabase } from '@/db/utils'

import { channels } from '@/db/tables/channels'
import { ApiException } from '@/lib/api-exception'

import type { CreateChannelBody, CreateChannelParams } from './schema/create-channel.schema'
import type { DeleteChannelParams } from './schema/delete-channel.schema'
import type { GetChannelParams } from './schema/get-channel.schema'
import type { GetChannelsInCommunityParams } from './schema/get-channels-in-community.schema'
import type { UpdateChannelBody, UpdateChannelParams } from './schema/update-channel.schema'

export class ChannelsService {
  constructor(
    private readonly db: DrizzleDatabase,
  ) { }

  async getChannelById(params: GetChannelParams) {
    const channel = await this.db.query.channels.findFirst({
      where: {
        id: params.channelId,
      },
      with: {
        community: true,
      },
    })
    if (!channel)
      throw ApiException.NotFound('Channel not found', 'CHANNEL_NOT_FOUND')

    return channel
  }

  async getChannelsByCommunityId(params: GetChannelsInCommunityParams) {
    const channels = await this.db.query.channels.findMany({
      where: {
        communityId: params.communityId,
      },
    })

    return channels
  }

  async updateChannel(params: UpdateChannelParams, data: UpdateChannelBody) {
    const channel = await this.db.query.channels.findFirst({
      where: {
        id: params.channelId,
      },
      with: {
        community: true,
      },
    })
    if (!channel)
      throw ApiException.NotFound('Channel not found', 'CHANNEL_NOT_FOUND')

    const [updatedChannel] = await this.db
      .update(channels)
      .set({
        name: data.name,
        description: data.description,
      })
      .where(eq(channels.id, params.channelId))
      .returning()

    return updatedChannel
  }

  async deleteChannel(params: DeleteChannelParams) {
    const channel = await this.db.query.channels.findFirst({
      where: {
        id: params.channelId,
      },
      with: {
        community: true,
      },
    })
    if (!channel)
      throw ApiException.NotFound('Channel not found', 'CHANNEL_NOT_FOUND')

    const [deletedChannel] = await this.db
      .delete(channels)
      .where(eq(channels.id, params.channelId))
      .returning()

    return deletedChannel
  }

  async createChannel(params: CreateChannelParams, data: CreateChannelBody) {
    const channel = await this.db.query.channels.findFirst({
      where: {
        communityId: params.communityId,
      },
    })
    if (channel)
      throw ApiException.BadRequest('Channel with this name already exists', 'CHANNEL_ALREADY_EXISTS')

    const [newChannel] = await this.db
      .insert(channels)
      .values({
        communityId: params.communityId,
        name: data.name,
        description: data.description,
      })
      .returning()

    return newChannel
  }
}
