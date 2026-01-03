import type { Context } from 'hono'
import type { WSContext, WSMessageReceive } from 'hono/ws'

import type { DrizzleDatabase } from '@/db/utils'
import type { Env } from '@/lib/factory'

import { pino } from '@/lib/pino'

import type { MessagesService } from '../messages/messages.service'

import { CreateMessageSchema } from './schema/create-message.schema'
import { DeleteMessageSchema } from './schema/delete-message.schema'
import { UpdateMessageSchema } from './schema/update-message.schema'
import { EventMessageHandler } from './utils/event-message-handler'
import {
  CreatedMessageResponse,
  DeletedMessageResponse,
  ErrorResponse,
  UpdatedMessageResponse,
  WsEventType,
} from './utils/websocket-message'

// entirely vibecoded, will refactor later
export class WebsocketService {
  private readonly connections = new Map<number, Set<WSContext>>()

  constructor(
    private readonly db: DrizzleDatabase,
    private readonly messagesService: MessagesService,
  ) {}

  private addConnection(userId: number, ws: WSContext) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set())
    }
    this.connections.get(userId)!.add(ws)
  }

  private removeConnection(userId: number, ws: WSContext) {
    const userConnections = this.connections.get(userId)
    if (userConnections) {
      userConnections.delete(ws)
      if (userConnections.size === 0) {
        this.connections.delete(userId)
      }
    }
  }

  private async broadcastToChannel(channelId: number, message: any) {
    const channel = await this.db.query.channels.findFirst({
      where: { id: channelId },
    })
    if (!channel)
      return

    const members = await this.db.query.communityMembers.findMany({
      where: { communityId: channel.communityId },
    })

    const messageStr = JSON.stringify(message)

    for (const member of members) {
      const userConnections = this.connections.get(member.userId)
      if (userConnections) {
        for (const ws of userConnections) {
          ws.send(messageStr)
        }
      }
    }
  }

  async handleConnection(c: Context<Env, '/ws'>) {
    const user = c.get('user')
    if (!user) {
      return {
        onOpen: (_event: Event, ws: WSContext) => {
          ws.close(1008, 'Unauthorized')
        },
      }
    }

    const eventMessageHandler = new EventMessageHandler()

    eventMessageHandler.handle(
      WsEventType.CREATE_MESSAGE,
      CreateMessageSchema,
      async (payload, ws) => {
        try {
          const message = await this.messagesService.createMessage(payload.channelId, payload, user.id)
          await this.broadcastToChannel(payload.channelId, new CreatedMessageResponse(message))
        }
        catch (error: any) {
          pino.error(error)
          ws.send(JSON.stringify(new ErrorResponse(error.message, error.code || 'INTERNAL_ERROR')))
        }
      },
    )

    eventMessageHandler.handle(
      WsEventType.UPDATE_MESSAGE,
      UpdateMessageSchema,
      async (payload, ws) => {
        try {
          const message = await this.messagesService.updateMessage(payload.messageId, { content: payload.content }, user.id)
          await this.broadcastToChannel(message.channelId, new UpdatedMessageResponse(message))
        }
        catch (error: any) {
          pino.error(error)
          ws.send(JSON.stringify(new ErrorResponse(error.message, error.code || 'INTERNAL_ERROR')))
        }
      },
    )

    eventMessageHandler.handle(
      WsEventType.DELETE_MESSAGE,
      DeleteMessageSchema,
      async (payload, ws) => {
        try {
          const message = await this.db.query.messages.findFirst({
            where: { id: payload.messageId },
          })
          if (!message)
            return

          await this.messagesService.deleteMessage(payload.messageId, user.id)
          await this.broadcastToChannel(message.channelId, new DeletedMessageResponse(payload.messageId, message.channelId))
        }
        catch (error: any) {
          pino.error(error)
          ws.send(JSON.stringify(new ErrorResponse(error.message, error.code || 'INTERNAL_ERROR')))
        }
      },
    )

    return {
      onOpen: (_event: Event, ws: WSContext) => {
        this.addConnection(user.id, ws)
        pino.info({ userId: user.id }, 'WebSocket connection opened')
      },
      onMessage: async (event: MessageEvent<WSMessageReceive>, ws: WSContext) => {
        await eventMessageHandler.onMessageEvent(event, ws)
      },
      onClose: (_event: CloseEvent, ws: WSContext) => {
        this.removeConnection(user.id, ws)
        pino.info({ userId: user.id }, 'WebSocket connection closed')
      },
    }
  }
}
