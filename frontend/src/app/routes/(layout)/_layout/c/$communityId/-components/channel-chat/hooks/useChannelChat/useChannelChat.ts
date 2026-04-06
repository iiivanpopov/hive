import { useEvent } from '@siberiacancode/reactuse'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useLoaderData } from '@tanstack/react-router'
import { useEffect, useMemo, useRef } from 'react'

import { getCommunitiesCommunityIdMembersOptions } from '@/api/@tanstack/react-query.gen'
import { useI18n } from '@/providers/i18n-provider'

import {
  clearPendingMessageTimeouts,
} from '../../pendingMessageTimeouts'
import {
  clearActiveChannelChatSession,
  hydrateActiveChannelChatSession,
  useActiveChannelChatIsLoadingOlderMessages,
  useActiveChannelChatMessages,
} from '../../store/session.store'
import { useChannelChatAutoScroll } from './useChannelChatAutoScroll'
import { useChannelChatInput } from './useChannelChatInput'
import { useChannelChatPagination } from './useChannelChatPagination'
import { useChannelChatWebsocket } from './useChannelChatWebsocket'

export function useChannelChat() {
  const { channel, initialPage } = useLoaderData({
    from: '/(layout)/_layout/c/$communityId/_layout/$channelId/',
  })
  const i18n = useI18n()

  const messages = useActiveChannelChatMessages(channel.id)
  const isLoadingOlderMessages = useActiveChannelChatIsLoadingOlderMessages(channel.id)

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const membersQuery = useSuspenseQuery(getCommunitiesCommunityIdMembersOptions({
    path: { communityId: channel.communityId },
  }))

  const websocket = useChannelChatWebsocket(channel.id)
  const input = useChannelChatInput({ websocket })
  const pagination = useChannelChatPagination({ messagesContainerRef })
  const autoScroll = useChannelChatAutoScroll({ messagesContainerRef, messagesEndRef })

  const viewMessages = useMemo(() => {
    const membersById = new Map(membersQuery.data.members.map(member => [member.id, member]))

    return messages.map((message) => {
      const member = membersById.get(message.userId)
      const author = member?.name ?? member?.username ?? 'Unknown user'

      return {
        id: message.localId,
        author,
        avatarFallback: author.at(0)?.toUpperCase() ?? '?',
        content: message.content,
        messageTime: new Date(message.createdAt).toLocaleTimeString(i18n.locale, {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sending: message.deliveryStatus === 'sending',
        failed: message.deliveryStatus === 'failed',
      }
    })
  }, [messages, membersQuery.data.members, i18n.locale])

  const hydrateChatSession = useEvent(() => {
    hydrateActiveChannelChatSession(channel.id, initialPage.messages, initialPage.hasMore)
  })

  const clearChatSession = useEvent(() => {
    clearPendingMessageTimeouts()
    clearActiveChannelChatSession()
  })

  useEffect(() => {
    hydrateChatSession()
  }, [channel.id, initialPage.messages, initialPage.hasMore])

  useEffect(() => () => clearChatSession(), [channel.id])

  return {
    state: {
      channel,
      isLoadingOlderMessages,
      messages: viewMessages,
    },
    refs: {
      messagesContainerRef,
      messagesEndRef,
    },
    functions: {
      handleMessagesScroll: () => {
        autoScroll.handleMessagesScroll()
        pagination.handleMessagesScroll()
      },
    },
    features: {
      i18n,
      input,
    },
  }
}
