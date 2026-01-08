import type { Context } from 'hono'
import type { WSContext, WSEvents } from 'hono/ws'

import type { User } from '@/db/tables/users'
import type { DrizzleDatabase } from '@/db/utils'
import type { Env } from '@/lib/factory'
import type { MessagesService } from '@/modules/messages/messages.service'

import { ApiException } from '@/lib/api-exception'
import { pino } from '@/lib/pino'

import type { WsResponse } from './utils/websocket-message'

import { CreateMessageSchema } from './schema/create-message.schema'
import { EventMessageHandler } from './utils/event-message-handler'
import { CreatedMessageResponse, WsEventType } from './utils/websocket-message'

export class WebsocketService {
  private connections = new Map<number, Set<WSContext>>()

  constructor(
    private readonly db: DrizzleDatabase,
    private readonly messagesService: MessagesService,
  ) { }

  private notify(channelId: number, message: WsResponse<any>) {
    const connections = this.connections.get(channelId) ?? new Set()
    for (const connection of connections)
      connection.send(JSON.stringify(message))
  }

  private onOpen(query: { channelId: number }): WSEvents<unknown>['onOpen'] {
    return (_event, ws) => {
      const connections = this.connections.get(query.channelId) ?? new Set()
      this.connections.set(query.channelId, new Set([...connections, ws]))
    }
  }

  private onClose(query: { channelId: number }): WSEvents<unknown>['onClose'] {
    return (_event, ws) => {
      this.connections.get(query.channelId)?.delete(ws)
      if (this.connections.get(query.channelId)?.size === 0)
        this.connections.delete(query.channelId)
    }
  }

  private onMessage(query: { channelId: number }, user: User): WSEvents<unknown>['onMessage'] {
    return async (event, ws) => {
      const handler = new EventMessageHandler()
        .handle(
          WsEventType.CREATE_MESSAGE,
          CreateMessageSchema,
          async (data) => {
            const message = await this.messagesService.createMessage({ channelId: query.channelId }, data, user)
            pino.info(`Message created: ${message.id}`)
            this.notify(query.channelId, new CreatedMessageResponse(message))
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
