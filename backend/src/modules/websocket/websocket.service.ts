import type { Context } from 'hono'
import type { WSEvents } from 'hono/ws'

import type { User } from '@/db/tables/users'
import type { DrizzleDatabase } from '@/db/utils'
import type { Env } from '@/lib/factory'
import type { MessagesService } from '@/modules/messages/messages.service'

import { ApiException } from '@/lib/api-exception'
import { pino } from '@/lib/pino'

import type { ChannelBroadcastService } from './channel-broadcast.service'

import { CreateMessageSchema } from './schema/create-message.schema'
import { EventMessageHandler } from './utils/event-message-handler'
import { CreatedMessageResponse, WsEventType } from './utils/websocket-message'

export class WebsocketService {
  constructor(
    private readonly db: DrizzleDatabase,
    private readonly messagesService: MessagesService,
    private readonly channelBroadcastService: ChannelBroadcastService,
  ) { }

  private onOpen(query: { channelId: number }): WSEvents<unknown>['onOpen'] {
    return (_event, ws) => {
      this.channelBroadcastService.addConnection(query.channelId, ws)
    }
  }

  private onClose(query: { channelId: number }): WSEvents<unknown>['onClose'] {
    return (_event, ws) => {
      this.channelBroadcastService.removeConnection(query.channelId, ws)
    }
  }

  private onMessage(query: { channelId: number }, user: User): WSEvents<unknown>['onMessage'] {
    return async (event, ws) => {
      const handler = new EventMessageHandler()
        .handle(
          WsEventType.CREATE_MESSAGE,
          CreateMessageSchema,
          async (data) => {
            const membership = await this.db.query.communityMembers.findFirst({
              where: {
                community: {
                  channels: {
                    id: query.channelId,
                  },
                },
                userId: user.id,
              },
            })

            if (!membership)
              throw ApiException.NotFound('Not a community member', 'NOT_A_MEMBER')

            const message = await this.messagesService.createMessage(
              { channelId: query.channelId },
              { content: data.content },
              user,
            )
            pino.info(`Message created: ${message.id}`)
            this.channelBroadcastService.broadcast(
              query.channelId,
              new CreatedMessageResponse(message, data.clientId),
            )
          },
        )
        .onMessageEvent(event, ws)

      return handler
    }
  }

  handle(c: Context<Env>): WSEvents {
    const rawQuery = c.req.query()
    const user = c.get('user')

    const query = {
      channelId: Number(rawQuery.channelId),
    }

    if (Number.isNaN(query.channelId))
      throw ApiException.BadRequest('Invalid channel ID', 'INVALID_CHANNEL_ID')

    return {
      onOpen: this.onOpen(query),
      onClose: this.onClose(query),
      onMessage: this.onMessage(query, user),
    }
  }
}
