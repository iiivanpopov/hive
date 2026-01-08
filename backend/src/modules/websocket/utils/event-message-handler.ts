import type { WSContext, WSMessageReceive } from 'hono/ws'
import type z from 'zod'

import { ApiException } from '@/lib/api-exception'
import { mapValidationErrors } from '@/middleware'

import type { WsMessage } from './websocket-message'

import { ErrorResponse, InvalidMessageResponse, InvalidPayloadResponse } from './websocket-message'

function mapHttpToWsStatusCode(httpStatus: number): number {
  switch (httpStatus) {
    case 400: // Bad Request
      return 1003 // Unsupported Data
    case 401: // Unauthorized
      return 1008 // Policy Violation
    case 403: // Forbidden
      return 1008 // Policy Violation
    case 404: // Not Found
      return 1002 // Protocol Error
    case 408: // Request Timeout
      return 1001 // Going Away
    case 409: // Conflict
      return 1003 // Unsupported Data
    case 413: // Payload Too Large
      return 1009 // Message Too Big
    case 429: // Too Many Requests
      return 1008 // Policy Violation
    case 500: // Internal Server Error
      return 1011 // Internal Error
    case 501: // Not Implemented
      return 1003 // Unsupported Data
    case 503: // Service Unavailable
      return 1001 // Going Away
    default:
      // For any other status code, default to Internal Error
      return httpStatus >= 500 ? 1011 : 1003
  }
}

export class EventMessageHandler {
  handlers: Map<
    string,
    {
      callback: (payload: any, ws: WSContext) => Promise<void> | void
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
    eventType: string,
    schema: Schema,
    handler: (
      payload: z.infer<Schema>,
      ws: WSContext,
    ) => Promise<void> | void,
  ) {
    this.handlers.set(eventType, { callback: handler, schema })
    return this
  }

  async onMessageEvent(event: MessageEvent<WSMessageReceive>, ws: WSContext) {
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

    try {
      const result = await callback(parsed.data, ws)
      return result
    }
    catch (error) {
      if (error instanceof ErrorResponse)
        return ws.send(this.serialize(error))

      if (error instanceof ApiException) {
        return ws.send(this.serialize(
          new ErrorResponse(
            error.message,
            mapHttpToWsStatusCode(error.status),
          ),
        ))
      }

      return ws.send(this.serialize(
        new ErrorResponse(
          (error as any).message || 'Internal Server Error',
          1011,
        ),
      ))
    }
  }
}
