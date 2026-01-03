import type { Context } from 'hono'
import type { WSContext, WSMessageReceive } from 'hono/ws'

import type { DrizzleDatabase } from '@/db/utils'
import type { Env } from '@/lib/factory'

import { pino } from '@/lib/pino'

import { CreateMessageSchema } from './schema/create-message.schema'
import { EventMessageHandler } from './utils/event-message-handler'
import { WsEventType } from './utils/websocket-message'

export class WebsocketService {
  constructor(
    private readonly db: DrizzleDatabase,
  ) {}

  async handleConnection(_c: Context<Env, '/ws'>) {
    return {
      onMessage: async (event: MessageEvent<WSMessageReceive>, ws: WSContext<any>) => {
        const eventMessageHandler = new EventMessageHandler()

        eventMessageHandler.handle(
          WsEventType.CREATE_MESSAGE,
          CreateMessageSchema,
          (payload) => {
            pino.info(payload)
            ws.send('Hello world!')
          },
        )

        eventMessageHandler.onMessageEvent(event, ws)
      },
      onClose: () => {
        pino.info('Connection closed')
      },
    }
  }
}
