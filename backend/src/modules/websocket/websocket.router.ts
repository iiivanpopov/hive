import { describeRoute } from 'hono-openapi'
import { upgradeWebSocket } from 'hono/bun'

import type { DrizzleDatabase } from '@/db/utils'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'
import type { BaseRouter } from '@/types/interfaces'

import { factory } from '@/lib/factory'
import { session } from '@/middleware'
import { MessagesService } from '@/modules/messages'

import { WebsocketService } from './websocket.service'

export class WebsocketRouter implements BaseRouter {
  readonly basePath = '/ws'
  private readonly websocketService: WebsocketService

  constructor(
    private readonly db: DrizzleDatabase,
    private readonly sessionTokens: SessionTokenRepository,
  ) {
    const messagesService = new MessagesService(db)
    this.websocketService = new WebsocketService(db, messagesService)
  }

  init() {
    const app = factory
      .createApp()
      .basePath(this.basePath)
      .get(
        '/',
        describeRoute({
          tags: ['Websocket'],
          summary: 'WebSocket endpoint',
          description: 'Establish a WebSocket connection for real-time communication.',
        }),
        session(this.db, this.sessionTokens),
        upgradeWebSocket(this.websocketService.handle),
      )

    return app
  }
}
