import { useEvent, useTextareaAutosize, useWebSocket } from '@siberiacancode/reactuse'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useLoaderData, useRouteContext } from '@tanstack/react-router'
import { useEffect, useMemo, useRef } from 'react'

import { getCommunitiesCommunityIdMembersOptions } from '@/api/@tanstack/react-query.gen'
import { env } from '@/config/env'
import { useI18n } from '@/providers/i18n-provider'

import type { ChannelChatMessage, ServerMessage } from '../store'

import {
  appendChannelChatMessage,
  appendServerChannelChatMessage,
  hydrateChannelChatState,
  markChannelChatMessageFailed,
  resetChannelChatState,
  useChannelChatMessages,
} from '../store'

const MAX_MESSAGE_LENGTH = 1000
const MESSAGE_ACK_TIMEOUT = 10_000

interface CreateMessagePayload {
  clientId?: string
  message: ServerMessage
}

interface WebSocketMessage<Payload = unknown> {
  type: string
  payload: Payload
  timestamp: number
}

interface FailedMessagePayload {
  clientId?: string
}

export interface ChannelChatViewMessage {
  id: number | string
  author: string
  avatarFallback: string
  content: string
  messageTime: string
  optimistic: boolean
  failed: boolean
}

function getChannelChatWebSocketUrl(channelId: number) {
  const url = new URL('/ws', env.apiUrl)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.searchParams.set('channelId', String(channelId))

  return url.toString()
}

export function useChannelChat() {
  const { channel, initialMessages } = useLoaderData({ from: '/(layout)/_layout/c/$communityId/_layout/$channelId/' })
  const { user } = useRouteContext({ from: '__root__' })
  const i18n = useI18n()

  const messages = useChannelChatMessages(channel.id)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textarea = useTextareaAutosize<HTMLTextAreaElement>()
  const messageTimeoutsRef = useRef(new Map<string, number>())

  const membersQuery = useSuspenseQuery(getCommunitiesCommunityIdMembersOptions({
    path: { communityId: channel.communityId },
  }))

  const membersById = useMemo(
    () => new Map(membersQuery.data.members.map(member => [member.id, member])),
    [membersQuery.data.members],
  )

  const mappedMessages = useMemo<Array<ChannelChatViewMessage>>(
    () => messages.map((message) => {
      const member = membersById.get(message.userId)
      const author = member?.name ?? member?.username ?? 'Unknown user'

      return {
        id: message.id,
        author,
        avatarFallback: author.at(0)?.toUpperCase() ?? '?',
        content: message.content,
        messageTime: new Date(message.createdAt).toLocaleTimeString(i18n.locale, {
          hour: '2-digit',
          minute: '2-digit',
        }),
        optimistic: message.optimistic,
        failed: message.failed,
      }
    }),
    [i18n.locale, membersById, messages],
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' })
  }, [mappedMessages.at(-1)?.id])

  const resetChannelState = useEvent((nextChannelId: number | null) => {
    for (const timeoutId of messageTimeoutsRef.current.values())
      window.clearTimeout(timeoutId)

    messageTimeoutsRef.current.clear()
    resetChannelChatState(nextChannelId)
    textarea.set('')
  })

  const clearMessageTimeout = useEvent((clientId?: string) => {
    if (!clientId)
      return

    const timeoutId = messageTimeoutsRef.current.get(clientId)

    if (timeoutId != null) {
      window.clearTimeout(timeoutId)
      messageTimeoutsRef.current.delete(clientId)
    }
  })

  useEffect(() => {
    const nextMessages = [...initialMessages].reverse().map(message => ({
      ...message,
      optimistic: false,
      failed: false,
    }))

    hydrateChannelChatState(channel.id, nextMessages)

    return () => resetChannelState(null)
  }, [channel.id, initialMessages])

  const websocket = useWebSocket(getChannelChatWebSocketUrl(channel.id), {
    retry: true,
    onMessage: (event) => {
      if (typeof event.data !== 'string')
        return

      let rawMessage: WebSocketMessage<CreateMessagePayload | FailedMessagePayload>

      try {
        rawMessage = JSON.parse(event.data) as WebSocketMessage<CreateMessagePayload>
      }
      catch {
        return
      }

      if (rawMessage.type === 'CREATE_MESSAGE' && rawMessage.payload && typeof rawMessage.payload === 'object' && 'message' in rawMessage.payload) {
        clearMessageTimeout(rawMessage.payload.clientId)

        const nextMessage: ChannelChatMessage = {
          ...rawMessage.payload.message,
          clientId: rawMessage.payload.clientId,
          optimistic: false,
          failed: false,
        }

        appendServerChannelChatMessage(nextMessage, rawMessage.payload.clientId)
        return
      }

      if (rawMessage.type === 'ERROR' || rawMessage.type === 'INVALID_PAYLOAD') {
        clearMessageTimeout(rawMessage.payload?.clientId)

        if (rawMessage.payload?.clientId)
          markChannelChatMessageFailed(channel.id, rawMessage.payload.clientId)
      }
    },
  })

  const submitMessage = () => {
    const content = textarea.value.trim()

    if (!user || !content || content.length > MAX_MESSAGE_LENGTH || websocket.status !== 'connected')
      return

    const clientId = crypto.randomUUID()
    const optimisticTimestamp = new Date().toISOString()

    appendChannelChatMessage({
      id: `optimistic:${clientId}`,
      clientId,
      channelId: channel.id,
      userId: user.id,
      content,
      createdAt: optimisticTimestamp,
      updatedAt: optimisticTimestamp,
      optimistic: true,
      failed: false,
    })

    const timeoutId = setTimeout(() => {
      messageTimeoutsRef.current.delete(clientId)
      markChannelChatMessageFailed(channel.id, clientId)
    }, MESSAGE_ACK_TIMEOUT)

    messageTimeoutsRef.current.set(clientId, timeoutId)

    textarea.set('')

    websocket.send(JSON.stringify({
      type: 'CREATE_MESSAGE',
      payload: {
        clientId,
        content,
      },
      timestamp: Date.now(),
    }))
  }

  return {
    state: {
      channel,
      messages: mappedMessages,
      canSendMessage:
        !!user
        && textarea.value.trim().length > 0
        && textarea.value.trim().length <= MAX_MESSAGE_LENGTH
        && websocket.status === 'connected',
    },
    refs: {
      messagesContainerRef,
      messagesEndRef,
      textareaRef: textarea.ref,
    },
    functions: {
      setDraft: textarea.set,
      submitMessage,
    },
    features: {
      i18n,
      textarea,
      websocket,
    },
  }
}
