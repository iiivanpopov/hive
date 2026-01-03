import { eq } from 'drizzle-orm'

import type { DrizzleDatabase } from '@/db/utils'

import { messages } from '@/db/tables/messages'
import { ApiException } from '@/lib/api-exception'

import type { CreateMessageBody } from './schema/create-message.schema'
import type { UpdateMessageBody } from './schema/update-message.schema'

export class MessagesService {
  constructor(
    private readonly db: DrizzleDatabase,
  ) {}

  async getMessagesInChannel(channelId: number, userId: number) {
    const channel = await this.db.query.channels.findFirst({
      where: {
        id: channelId,
      },
    })
    if (!channel)
      throw ApiException.NotFound('Channel not found', 'CHANNEL_NOT_FOUND')

    const membership = await this.db.query.communityMembers.findFirst({
      where: {
        communityId: channel.communityId,
        userId,
      },
    })

    if (!membership)
      throw ApiException.BadRequest('You are not a member of this community', 'NOT_A_MEMBER')

    const messagesList = await this.db.query.messages.findMany({
      where: {
        channelId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return messagesList
  }

  async createMessage(channelId: number, data: CreateMessageBody, userId: number) {
    const channel = await this.db.query.channels.findFirst({
      where: {
        id: channelId,
      },
    })
    if (!channel)
      throw ApiException.NotFound('Channel not found', 'CHANNEL_NOT_FOUND')

    const membership = await this.db.query.communityMembers.findFirst({
      where: {
        communityId: channel.communityId,
        userId,
      },
    })

    if (!membership)
      throw ApiException.BadRequest('You are not a member of this community', 'NOT_A_MEMBER')

    const [message] = await this.db
      .insert(messages)
      .values({
        channelId,
        userId,
        content: data.content,
      })
      .returning()

    return message
  }

  async updateMessage(messageId: number, data: UpdateMessageBody, userId: number) {
    const message = await this.db.query.messages.findFirst({
      where: {
        id: messageId,
      },
      with: {
        channel: true,
      },
    })

    if (!message)
      throw ApiException.NotFound('Message not found', 'MESSAGE_NOT_FOUND')

    const membership = await this.db.query.communityMembers.findFirst({
      where: {
        communityId: message.channel!.communityId,
        userId,
      },
    })

    if (!membership)
      throw ApiException.BadRequest('You are not a member of this community', 'NOT_A_MEMBER')

    if (message.userId !== userId)
      throw ApiException.Forbidden('You do not have permission to update this message', 'FORBIDDEN')

    const [updatedMessage] = await this.db
      .update(messages)
      .set({
        content: data.content,
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId))
      .returning()

    return updatedMessage
  }

  async deleteMessage(messageId: number, userId: number) {
    const message = await this.db.query.messages.findFirst({
      where: {
        id: messageId,
      },
      with: {
        channel: true,
      },
    })

    if (!message)
      throw ApiException.NotFound('Message not found', 'MESSAGE_NOT_FOUND')

    const membership = await this.db.query.communityMembers.findFirst({
      where: {
        communityId: message.channel!.communityId,
        userId,
      },
    })

    if (!membership)
      throw ApiException.BadRequest('You are not a member of this community', 'NOT_A_MEMBER')

    if (message.userId !== userId && membership.role !== 'owner')
      throw ApiException.Forbidden('You do not have permission to delete this message', 'FORBIDDEN')

    await this.db
      .delete(messages)
      .where(eq(messages.id, messageId))
  }
}
