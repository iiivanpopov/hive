import { eq } from 'drizzle-orm'

import type { DrizzleDatabase } from '@/db/utils'

import { channels } from '@/db/tables/channels'
import { ApiException } from '@/lib/api-exception'

import type { CreateChannelBody } from './schema/create-channel.schema'
import type { UpdateChannelBody } from './schema/update-channel.schema'

export class ChannelsService {
  constructor(
    private readonly db: DrizzleDatabase,
  ) { }

  async getChannelsByCommunityId(communityId: number, userId: number) {
    const membership = await this.db.query.communityMembers.findFirst({
      where: {
        communityId,
        userId,
      },
    })
    if (!membership)
      throw ApiException.BadRequest('You are not a member of this community', 'NOT_A_MEMBER')

    const channelsList = await this.db.query.channels.findMany({
      where: {
        communityId,
      },
    })

    return channelsList
  }

  async updateChannel(channelId: number, data: UpdateChannelBody, userId: number) {
    const channel = await this.db.query.channels.findFirst({
      where: {
        id: channelId,
      },
      with: {
        community: true,
      },
    })
    if (!channel)
      throw ApiException.NotFound('Channel not found', 'CHANNEL_NOT_FOUND')

    const member = await this.db.query.communityMembers.findFirst({
      where: {
        communityId: channel.community!.id,
        userId,
      },
    })
    if (!member)
      throw ApiException.BadRequest('You are not a member of this community', 'NOT_A_MEMBER')

    if (member.role !== 'owner')
      throw ApiException.Forbidden('You do not have permission to update this channel', 'FORBIDDEN')

    await this.db
      .update(channels)
      .set({
        name: data.name,
        description: data.description,
      })
      .where(eq(channels.id, channelId))
  }

  async deleteChannel(channelId: number, userId: number) {
    const channel = await this.db.query.channels.findFirst({
      where: {
        id: channelId,
      },
      with: {
        community: true,
      },
    })
    if (!channel)
      throw ApiException.NotFound('Channel not found', 'CHANNEL_NOT_FOUND')

    const member = await this.db.query.communityMembers.findFirst({
      where: {
        communityId: channel.community!.id,
        userId,
      },
    })
    if (!member)
      throw ApiException.BadRequest('You are not a member of this community', 'NOT_A_MEMBER')

    if (member.role !== 'owner')
      throw ApiException.Forbidden('You do not have permission to delete this channel', 'FORBIDDEN')

    await this.db
      .delete(channels)
      .where(eq(channels.id, channelId))
  }

  async createChannel(communityId: number, data: CreateChannelBody, userId: number) {
    const channel = await this.db.query.channels.findFirst({
      where: {
        communityId,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      },
    })
    if (channel)
      throw ApiException.BadRequest('Channel with this name already exists', 'CHANNEL_ALREADY_EXISTS')

    const member = await this.db.query.communityMembers.findFirst({
      where: {
        communityId,
        userId,
      },
    })
    if (!member)
      throw ApiException.BadRequest('You are not a member of this community', 'NOT_A_MEMBER')

    if (member.role !== 'owner')
      throw ApiException.Forbidden('You do not have permission to create channels in this community', 'FORBIDDEN')

    const [newChannel] = await this.db
      .insert(channels)
      .values({
        communityId,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        name: data.name,
        description: data.description,
        type: data.type,
      })
      .returning()

    return newChannel
  }
}
