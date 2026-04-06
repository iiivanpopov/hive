import type { RefObject } from 'react'

import { useEvent } from '@siberiacancode/reactuse'
import { useParams, useRouteContext } from '@tanstack/react-router'
import { useEffect, useLayoutEffect, useRef } from 'react'

import { useActiveChannelChatMessages } from '../../store/session.store'

const SCROLL_TO_BOTTOM_THRESHOLD = 120

interface UseChannelChatAutoScrollParams {
  messagesContainerRef: RefObject<HTMLDivElement | null>
  messagesEndRef: RefObject<HTMLDivElement | null>
}

function isNearBottom(container: HTMLDivElement) {
  return container.scrollHeight - container.scrollTop - container.clientHeight <= SCROLL_TO_BOTTOM_THRESHOLD
}

export function useChannelChatAutoScroll({
  messagesContainerRef,
  messagesEndRef,
}: UseChannelChatAutoScrollParams) {
  const channelId = useParams({
    from: '/(layout)/_layout/c/$communityId/_layout/$channelId/',
    select: params => params.channelId,
  })
  const { user } = useRouteContext({ from: '__root__' })
  const messages = useActiveChannelChatMessages(channelId)
  const isNearBottomRef = useRef(true)
  const lastRenderedMessageIdRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    isNearBottomRef.current = true
    lastRenderedMessageIdRef.current = undefined
  }, [channelId])

  const handleMessagesScroll = useEvent(() => {
    const container = messagesContainerRef.current
    if (!container)
      return

    isNearBottomRef.current = isNearBottom(container)
  })

  useLayoutEffect(() => {
    const lastMessage = messages.at(-1)
    if (!lastMessage)
      return

    const previousLastMessageId = lastRenderedMessageIdRef.current
    lastRenderedMessageIdRef.current = lastMessage.localId

    if (!previousLastMessageId) {
      messagesEndRef.current?.scrollIntoView({ block: 'end' })
      return
    }

    if (previousLastMessageId === lastMessage.localId)
      return

    if (
      isNearBottomRef.current
      || lastMessage.userId === user?.id
      || lastMessage.deliveryStatus === 'sending'
    ) {
      messagesEndRef.current?.scrollIntoView({ block: 'end' })
    }
  }, [messages])

  return {
    handleMessagesScroll,
  }
}
