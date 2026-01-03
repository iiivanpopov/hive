import type { Message } from '@/db/tables/messages'

export enum WsEventType {
  CREATE_MESSAGE = 'CREATE_MESSAGE',
  UPDATE_MESSAGE = 'UPDATE_MESSAGE',
  DELETE_MESSAGE = 'DELETE_MESSAGE',
  ERROR = 'ERROR',
  INVALID_MESSAGE = 'INVALID_MESSAGE',
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
}

export interface WsMessage<T = any> {
  type: WsEventType | string
  payload: T
  timestamp: number
}

export interface CreateMessagePayload {
  content: string
  channelId: number
}

export interface UpdateMessagePayload {
  content: string
  channelId: number
}

export interface DeleteMessagePayload {
  messageId: number
}

export class WsResponse<T = any> implements WsMessage<T> {
  type: WsEventType | string
  payload: T
  timestamp: number

  constructor(type: WsEventType | string, payload: T) {
    this.type = type
    this.payload = payload
    this.timestamp = Date.now()
  }
}

export class CreatedMessageResponse extends WsResponse<Message> {
  constructor(message: Message) {
    super(WsEventType.CREATE_MESSAGE, message)
  }
}

export class ErrorResponse extends WsResponse<{
  message: string
  code: string
}> {
  constructor(message: string, code: string) {
    super(WsEventType.ERROR, { message, code })
  }
}

export class InvalidMessageResponse extends WsResponse<string> {
  constructor(details: string) {
    super(WsEventType.INVALID_MESSAGE, details)
  }
}

export class InvalidPayloadResponse extends WsResponse<unknown> {
  constructor(details: unknown) {
    super(WsEventType.INVALID_PAYLOAD, details)
  }
}
