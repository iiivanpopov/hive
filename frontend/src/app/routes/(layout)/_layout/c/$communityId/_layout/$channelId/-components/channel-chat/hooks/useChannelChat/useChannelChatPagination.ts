import type { RefObject } from 'react'

import { useEvent, useLatest } from '@siberiacancode/reactuse'
import { useLoaderData, useParams } from '@tanstack/react-router'
import { useLayoutEffect, useRef } from 'react'

import type { GetChannelsChannelIdMessagesResponse } from '@/api/types.gen'

import { getChannelsChannelIdMessages } from '@/api/sdk.gen'

import {
  getOldestChannelChatServerMessageId,
  prependActiveChannelChatPage,
  setActiveChannelChatLoadingOlder,
  useActiveChannelChatHasOlderMessages,
  useActiveChannelChatIsLoadingOlderMessages,
  useActiveChannelChatMessages,
} from '../../store/session.store'

const MESSAGES_PAGE_SIZE = 50
const TOP_LOAD_THRESHOLD = 24

interface ScrollRestoreState {
  scrollHeight: number
  scrollTop: number
}

interface UseChannelChatPaginationParams {
  messagesContainerRef: RefObject<HTMLDivElement | null>
}

export function useChannelChatPagination({
  messagesContainerRef,
}: UseChannelChatPaginationParams) {
  const { initialPage } = useLoaderData({
    from: '/(layout)/_layout/c/$communityId/_layout/$channelId/',
  })
  const channelId = useParams({
    from: '/(layout)/_layout/c/$communityId/_layout/$channelId/',
    select: params => params.channelId,
  })
  const messages = useActiveChannelChatMessages(channelId)
  const hasOlderMessages = useActiveChannelChatHasOlderMessages(channelId, initialPage.hasMore)
  const isLoadingOlderMessages = useActiveChannelChatIsLoadingOlderMessages(channelId)
  const activeChannelId = useLatest(channelId)
  const pendingScrollRestoreRef = useRef<ScrollRestoreState | null>(null)

  useLayoutEffect(() => {
    pendingScrollRestoreRef.current = null
  }, [channelId])

  useLayoutEffect(() => {
    const pendingScrollRestore = pendingScrollRestoreRef.current
    const container = messagesContainerRef.current

    if (!pendingScrollRestore || !container)
      return

    container.scrollTop = container.scrollHeight - pendingScrollRestore.scrollHeight + pendingScrollRestore.scrollTop
    pendingScrollRestoreRef.current = null
  }, [messages])

  const loadOlderMessages = useEvent(async () => {
    const container = messagesContainerRef.current
    const oldestServerMessageId = getOldestChannelChatServerMessageId(messages)
    const requestChannelId = channelId

    if (!container || isLoadingOlderMessages || !hasOlderMessages || oldestServerMessageId == null)
      return

    pendingScrollRestoreRef.current = {
      scrollHeight: container.scrollHeight,
      scrollTop: container.scrollTop,
    }
    setActiveChannelChatLoadingOlder(requestChannelId, true)

    try {
      const response = await getChannelsChannelIdMessages({
        path: { channelId: requestChannelId },
        query: {
          limit: MESSAGES_PAGE_SIZE,
          before: oldestServerMessageId,
        },
        responseStyle: 'data',
        throwOnError: true,
      }) as unknown as GetChannelsChannelIdMessagesResponse

      if (activeChannelId.ref.current !== requestChannelId) {
        pendingScrollRestoreRef.current = null
        return
      }

      prependActiveChannelChatPage(requestChannelId, response.messages, response.hasMore)

      if (response.messages.length === 0)
        pendingScrollRestoreRef.current = null
    }
    catch {
      pendingScrollRestoreRef.current = null

      if (activeChannelId.ref.current === requestChannelId)
        setActiveChannelChatLoadingOlder(requestChannelId, false)
    }
  })

  const handleMessagesScroll = useEvent(() => {
    const container = messagesContainerRef.current

    if (!container || container.scrollTop > TOP_LOAD_THRESHOLD)
      return

    loadOlderMessages()
  })

  return {
    handleMessagesScroll,
  }
}
