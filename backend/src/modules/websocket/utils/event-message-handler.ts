import type { WSContext, WSMessageReceive } from 'hono/ws'
import type z from 'zod'

import { mapValidationErrors } from '@/middleware'

import type { WsMessage } from './websocket-message'

import { InvalidMessageResponse, InvalidPayloadResponse } from './websocket-message'

export class EventMessageHandler {
  handlers: Map<
    string,
    {
      callback: (payload: any) => Promise<void> | void
      schema: z.ZodTypeAny
    }
  > = new Map()

  private serialize(data: unknown) {
    return JSON.stringify(data)
  }

  private deserialize<T>(data: string): T | null {
    try {
      return JSON.parse(data) as T
    }
    catch {
      return null
    }
  }

  handle<Schema extends z.ZodTypeAny>(
    event: string,
    schema: Schema,
    handler: (
      payload: z.infer<Schema>,
    ) => Promise<void> | void,
  ) {
    this.handlers.set(event, { callback: handler, schema })
  }

  onMessageEvent(event: MessageEvent<WSMessageReceive>, ws: WSContext<any>) {
    if (typeof event.data !== 'string') {
      return ws.send(this.serialize(
        new InvalidMessageResponse('Received invalid message format'),
      ))
    }

    const message = this.deserialize<WsMessage>(event.data)
    if (!message) {
      return ws.send(this.serialize(
        new InvalidMessageResponse('Received invalid message format'),
      ))
    }

    if (typeof message !== 'object' || !('type' in message)) {
      return ws.send(this.serialize(
        new InvalidMessageResponse('Missing event type in message'),
      ))
    }

    const handler = this.handlers.get(message.type)
    if (!handler) {
      return ws.send(this.serialize(
        new InvalidMessageResponse('No handler found for event'),
      ))
    }

    const { schema, callback } = handler

    const parsed = schema.safeParse(message.payload)

    if (!parsed.success) {
      return ws.send(this.serialize(
        new InvalidPayloadResponse(mapValidationErrors(parsed.error.issues)),
      ))
    }

    return callback(parsed.data)
  }
}
