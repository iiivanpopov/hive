import { and, eq } from 'drizzle-orm'

import type { User } from '@/db/tables/users'
import type { DrizzleDatabase } from '@/db/utils'

import { messages } from '@/db/tables/messages'
import { ApiException } from '@/lib/api-exception'

import type { CreateMessageBody, CreateMessageParams } from './schema/create-message.schema'
import type { DeleteMessageParams } from './schema/delete-message.schema'
import type { GetChannelMessagesParams, GetChannelMessagesQuery } from './schema/get-channel-messages.schema'
import type { UpdateMessageBody, UpdateMessageParams } from './schema/update-message.schema'

export class MessagesService {
  constructor(
    private readonly db: DrizzleDatabase,
  ) { }

  async getMessagesInChannel(params: GetChannelMessagesParams, query: GetChannelMessagesQuery) {
    const channel = await this.db.query.channels.findFirst({
      where: {
        id: params.channelId,
      },
    })
    if (!channel)
      throw ApiException.NotFound('Channel not found', 'CHANNEL_NOT_FOUND')

    const messages = await this.db.query.messages.findMany({
      where: {
        id: params.channelId,
        ...(query.before && {
          id: { lt: query.before },
        }),
      },
      orderBy: {
        id: 'desc',
      },
      limit: query.limit + 1,
    })

    const hasMore = messages.length > query.limit

    return { messages, hasMore }
  }

  async createMessage(params: CreateMessageParams, data: CreateMessageBody, user: User) {
    const channel = await this.db.query.channels.findFirst({
      where: {
        id: params.channelId,
      },
    })
    if (!channel)
      throw ApiException.NotFound('Channel not found', 'CHANNEL_NOT_FOUND')

    const [message] = await this.db
      .insert(messages)
      .values({
        channelId: params.channelId,
        userId: user.id,
        content: data.content,
      })
      .returning()

    return message
  }

  async updateMessage(params: UpdateMessageParams, data: UpdateMessageBody, user: User) {
    const message = await this.db.query.messages.findFirst({
      where: {
        id: params.messageId,
        userId: user.id,
      },
      with: {
        channel: true,
      },
    })

    if (!message)
      throw ApiException.NotFound('Message not found', 'MESSAGE_NOT_FOUND')

    const [updatedMessage] = await this.db
      .update(messages)
      .set({
        content: data.content,
        updatedAt: new Date(),
      })
      .where(and(eq(messages.id, params.messageId), eq(messages.userId, user.id)))
      .returning()

    return updatedMessage
  }

  async deleteMessage(params: DeleteMessageParams, user: User) {
    const message = await this.db.query.messages.findFirst({
      where: {
        id: params.messageId,
        userId: user.id,
      },
      with: {
        channel: true,
      },
    })

    if (!message)
      throw ApiException.NotFound('Message not found', 'MESSAGE_NOT_FOUND')

    await this.db
      .delete(messages)
      .where(and(eq(messages.id, params.messageId), eq(messages.userId, user.id)))
  }
}
