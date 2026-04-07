import { useWebSocket } from '@siberiacancode/reactuse'
import z from 'zod'

import { clearPendingMessageTimeout } from '../../pendingMessageTimeouts'
import {
  markChannelChatMessageFailed,
  receiveChannelChatMessage,
} from '../../store/session.store'
import { getChannelChatWebSocketUrl } from './utils/get-channel-chat-web-socket-url'

interface WebSocketMessage {
  type: string
  payload: unknown
  timestamp: number
}

const ServerMessageSchema = z.object({
  id: z.number(),
  channelId: z.number(),
  userId: z.number(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const CreateMessagePayloadSchema = z.object({
  clientId: z.string().optional(),
  message: ServerMessageSchema,
})

const FailedMessagePayloadSchema = z.object({
  clientId: z.string().optional(),
})

export function useChannelChatWebsocket(channelId: number) {
  const websocket = useWebSocket(getChannelChatWebSocketUrl(channelId), {
    retry: true,
    onMessage: (event: MessageEvent) => {
      let rawMessage: WebSocketMessage

      try {
        rawMessage = JSON.parse(event.data)
      }
      catch {
        return
      }

      switch (rawMessage.type) {
        case 'CREATE_MESSAGE': {
          const { success, data } = CreateMessagePayloadSchema.safeParse(rawMessage.payload)
          if (!success)
            return

          clearPendingMessageTimeout(data.clientId)
          receiveChannelChatMessage(data.message, data.clientId)

          return
        }

        case 'ERROR':
        case 'INVALID_PAYLOAD': {
          const { success, data } = FailedMessagePayloadSchema.safeParse(rawMessage.payload)
          if (!success || !data.clientId)
            return

          clearPendingMessageTimeout(data.clientId)
          markChannelChatMessageFailed(channelId, data.clientId)
        }
      }
    },
  })

  return websocket
}
