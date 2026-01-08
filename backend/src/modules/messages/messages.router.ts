import { describeRoute, resolver } from 'hono-openapi'

import type { DrizzleDatabase } from '@/db/utils'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'
import type { BaseRouter } from '@/types/interfaces'

import { factory } from '@/lib/factory'
import { session, validator } from '@/middleware'
import { onlyMember } from '@/middleware/only-member.middleware'
import { role } from '@/middleware/role.middleware'

import { MessagesService } from './messages.service'
import { CreateMessageBodySchema, CreateMessageParamsSchema, CreateMessageResponseSchema } from './schema/create-message.schema'
import { DeleteMessageParamsSchema, DeleteMessageResponseSchema } from './schema/delete-message.schema'
import { GetChannelMessagesParamsSchema, GetChannelMessagesQuerySchema, GetChannelMessagesResponseSchema } from './schema/get-channel-messages.schema'
import { UpdateMessageBodySchema, UpdateMessageParamsSchema, UpdateMessageResponseSchema } from './schema/update-message.schema'

export class MessagesRouter implements BaseRouter {
  readonly basePath = '/'
  private readonly messagesService: MessagesService

  constructor(
    private readonly db: DrizzleDatabase,
    private readonly sessionTokens: SessionTokenRepository,
  ) {
    this.messagesService = new MessagesService(db)
  }

  init() {
    const app = factory
      .createApp()
      .basePath(this.basePath)
      .get(
        '/channels/:channelId/messages',
        describeRoute({
          tags: ['Messages'],
          summary: 'Get channel messages',
          description: 'Retrieve all messages in a specific channel.',
          responses: {
            200: {
              description: 'Messages retrieved successfully',
              content: {
                'application/json': {
                  schema: resolver(GetChannelMessagesResponseSchema),
                },
              },
            },
          },
        }),
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'channelId' }),
        role('all'),
        validator('param', GetChannelMessagesParamsSchema),
        validator('query', GetChannelMessagesQuerySchema),
        async (c) => {
          const params = c.req.valid('param')
          const query = c.req.valid('query')

          const response = await this.messagesService.getMessagesInChannel(params, query)

          return c.json(response)
        },
      )
      .post(
        '/channels/:channelId/messages',
        describeRoute({
          tags: ['Messages'],
          summary: 'Create a message',
          description: 'Create a new message in a channel.',
          responses: {
            201: {
              description: 'Message created successfully',
              content: {
                'application/json': {
                  schema: resolver(CreateMessageResponseSchema),
                },
              },
            },
          },
        }),
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'channelId' }),
        role('all'),
        validator('param', CreateMessageParamsSchema),
        validator('json', CreateMessageBodySchema),
        async (c) => {
          const params = c.req.valid('param')
          const body = c.req.valid('json')
          const user = c.get('user')

          const message = await this.messagesService.createMessage(params, body, user)

          return c.json({ message }, 201)
        },
      )
      .patch(
        '/messages/:messageId',
        describeRoute({
          tags: ['Messages'],
          summary: 'Update a message',
          description: 'Update the content of an existing message.',
          responses: {
            200: {
              description: 'Message updated successfully',
              content: {
                'application/json': {
                  schema: resolver(UpdateMessageResponseSchema),
                },
              },
            },
          },
        }),
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'messageId' }),
        role('all'),
        validator('param', UpdateMessageParamsSchema),
        validator('json', UpdateMessageBodySchema),
        async (c) => {
          const params = c.req.valid('param')
          const body = c.req.valid('json')
          const user = c.get('user')

          const message = await this.messagesService.updateMessage(params, body, user)

          return c.json({ message })
        },
      )
      .delete(
        '/messages/:messageId',
        describeRoute({
          tags: ['Messages'],
          summary: 'Delete a message',
          description: 'Delete a message by its ID.',
          responses: {
            200: {
              description: 'Message deleted successfully',
              content: {
                'application/json': {
                  schema: resolver(DeleteMessageResponseSchema),
                },
              },
            },
          },
        }),
        session(this.db, this.sessionTokens),
        onlyMember(this.db)({ param: 'messageId' }),
        role('all'),
        validator('param', DeleteMessageParamsSchema),
        async (c) => {
          const params = c.req.valid('param')
          const user = c.get('user')

          const message = await this.messagesService.deleteMessage(params, user)

          return c.json({ message })
        },
      )

    return app
  }
}
