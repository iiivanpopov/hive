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

export class WsResponse<T = any> implements WsMessage<T> {
  type: WsEventType | string
  payload: T
  timestamp: number

  constructor(type: WsEventType | string, payload: T) {
    this.type = type
    this.payload = payload
    this.timestamp = Date.now()
  }

  toJSON() {
    return {
      type: this.type,
      payload: this.payload,
      timestamp: this.timestamp,
    }
  }
}

export class CreatedMessageResponse extends WsResponse<Message> {
  constructor(message: Message) {
    super(WsEventType.CREATE_MESSAGE, message)
  }
}

export class UpdatedMessageResponse extends WsResponse<Message> {
  constructor(message: Message) {
    super(WsEventType.UPDATE_MESSAGE, message)
  }
}

export class DeletedMessageResponse extends WsResponse<{
  messageId: number
  channelId: number
}> {
  constructor(messageId: number, channelId: number) {
    super(WsEventType.DELETE_MESSAGE, { messageId, channelId })
  }
}

export class ErrorResponse extends WsResponse<{
  message: string
  code: number
}> {
  constructor(message: string, code: number) {
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
