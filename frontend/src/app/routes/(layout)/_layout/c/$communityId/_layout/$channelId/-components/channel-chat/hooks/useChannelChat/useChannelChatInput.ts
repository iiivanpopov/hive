import { useEvent } from '@siberiacancode/reactuse'
import { useParams, useRouteContext } from '@tanstack/react-router'
import { useLayoutEffect, useRef } from 'react'

import type { useChannelChatWebsocket } from './useChannelChatWebsocket'

import { schedulePendingMessageTimeout } from '../../pendingMessageTimeouts'
import {
  appendOutgoingChannelChatMessage,
  createSendingChannelChatMessage,
  setActiveChannelChatDraft,
  useActiveChannelChatDraft,
} from '../../store/session.store'

const MAX_MESSAGE_LENGTH = 1000

interface UseChannelChatInputParams {
  websocket: ReturnType<typeof useChannelChatWebsocket>
}

function resizeTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea)
    return

  textarea.style.height = 'auto'
  textarea.style.height = `${textarea.scrollHeight}px`
}

export function useChannelChatInput({
  websocket,
}: UseChannelChatInputParams) {
  const channelId = useParams({
    from: '/(layout)/_layout/c/$communityId/_layout/$channelId/',
    select: params => params.channelId,
  })
  const { user } = useRouteContext({ from: '__root__' })
  const draft = useActiveChannelChatDraft(channelId)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    resizeTextarea(textareaRef.current)
  }, [draft])

  const setDraft = useEvent((nextDraft: string) => {
    setActiveChannelChatDraft(channelId, nextDraft)
  })

  const submitMessage = useEvent(() => {
    const content = draft.trim()

    if (!user || !content || content.length > MAX_MESSAGE_LENGTH || websocket.status !== 'connected')
      return

    const clientId = crypto.randomUUID()
    const optimisticTimestamp = new Date().toISOString()

    appendOutgoingChannelChatMessage(createSendingChannelChatMessage({
      channelId,
      userId: user.id,
      content,
      clientId,
      timestamp: optimisticTimestamp,
    }))

    schedulePendingMessageTimeout(channelId, clientId)
    setDraft('')

    websocket.send(JSON.stringify({
      type: 'CREATE_MESSAGE',
      payload: {
        clientId,
        content,
      },
      timestamp: Date.now(),
    }))
  })

  const canSendMessage
    = !!user
      && draft.trim().length > 0
      && draft.trim().length <= MAX_MESSAGE_LENGTH
      && websocket.status === 'connected'

  return {
    draft,
    canSendMessage,
    textareaRef,
    setDraft,
    submitMessage,
  }
}
