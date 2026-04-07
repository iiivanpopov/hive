import { useEvent } from '@siberiacancode/reactuse'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useLoaderData, useRouteContext } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'

import { deleteMessagesMessageIdMutation, getCommunitiesCommunityIdMembersOptions, patchMessagesMessageIdMutation } from '@/api/@tanstack/react-query.gen'
import { useI18n } from '@/providers/i18n-provider'

import {
  clearPendingMessageTimeouts,
} from '../../pendingMessageTimeouts'
import {
  clearActiveChannelChatSession,
  hydrateActiveChannelChatSession,
  isActiveChannelChatMessageEdited,
  removeActiveChannelChatMessage,
  updateActiveChannelChatMessage,
  useActiveChannelChatIsLoadingOlderMessages,
  useActiveChannelChatMessages,
} from '../../store/session.store'
import { useChannelChatAutoScroll } from './useChannelChatAutoScroll'
import { useChannelChatInput } from './useChannelChatInput'
import { useChannelChatPagination } from './useChannelChatPagination'
import { useChannelChatWebsocket } from './useChannelChatWebsocket'

const MAX_MESSAGE_LENGTH = 1000

export function useChannelChat() {
  const { channel, initialPage } = useLoaderData({
    from: '/(layout)/_layout/c/$communityId/_layout/$channelId/',
  })
  const { user } = useRouteContext({ from: '__root__' })
  const i18n = useI18n()

  const messages = useActiveChannelChatMessages(channel.id)
  const isLoadingOlderMessages = useActiveChannelChatIsLoadingOlderMessages(channel.id)
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [editingMessageDraft, setEditingMessageDraft] = useState('')
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null)

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const membersQuery = useSuspenseQuery(getCommunitiesCommunityIdMembersOptions({
    path: { communityId: channel.communityId },
  }))

  const websocket = useChannelChatWebsocket(channel.id)
  const input = useChannelChatInput({ websocket })
  const pagination = useChannelChatPagination({ messagesContainerRef })
  const autoScroll = useChannelChatAutoScroll({ messagesContainerRef, messagesEndRef })

  const updateMessageMutation = useMutation(patchMessagesMessageIdMutation())
  const deleteMessageMutation = useMutation(deleteMessagesMessageIdMutation())

  const editedMessage = useMemo(
    () => editingMessageId == null
      ? null
      : messages.find(message => message.serverId === editingMessageId) ?? null,
    [editingMessageId, messages],
  )

  const canSubmitEditedMessage = !!editedMessage
    && editingMessageDraft.trim().length > 0
    && editingMessageDraft.trim().length <= MAX_MESSAGE_LENGTH
    && editingMessageDraft.trim() !== editedMessage.content
    && !updateMessageMutation.isPending

  const viewMessages = useMemo(() => {
    const membersById = new Map(membersQuery.data.members.map(member => [member.id, member]))

    return messages.map((message) => {
      const member = membersById.get(message.userId)
      const author = member?.name ?? member?.username ?? 'Unknown user'

      return {
        id: message.localId,
        serverId: message.serverId,
        userId: message.userId,
        author,
        avatarFallback: author.at(0)?.toUpperCase() ?? '?',
        content: message.content,
        messageTime: new Date(message.createdAt).toLocaleTimeString(i18n.locale, {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sending: message.deliveryStatus === 'sending',
        failed: message.deliveryStatus === 'failed',
        isOwnMessage: message.userId === user?.id,
        isEdited: isActiveChannelChatMessageEdited(message),
      }
    })
  }, [messages, membersQuery.data.members, i18n.locale, user?.id])

  const hydrateChatSession = useEvent(() => {
    hydrateActiveChannelChatSession(channel.id, initialPage.messages, initialPage.hasMore)
  })

  const clearChatSession = useEvent(() => {
    clearPendingMessageTimeouts()
    clearActiveChannelChatSession()
  })

  const cancelEditMessage = useEvent(() => {
    setEditingMessageId(null)
    setEditingMessageDraft('')
  })

  const openEditMessage = useEvent((messageId: number) => {
    const message = messages.find(candidate => candidate.serverId === messageId)

    if (!message || message.deliveryStatus !== 'sent' || message.userId !== user?.id)
      return

    setDeletingMessageId(null)
    setEditingMessageId(messageId)
    setEditingMessageDraft(message.content)
  })

  const requestDeleteMessage = useEvent((messageId: number) => {
    const message = messages.find(candidate => candidate.serverId === messageId)

    if (!message || message.deliveryStatus !== 'sent' || message.userId !== user?.id)
      return

    cancelEditMessage()
    setDeletingMessageId(messageId)
  })

  const cancelDeleteMessage = useEvent(() => {
    setDeletingMessageId(null)
  })

  const submitEditMessage = useEvent(async () => {
    if (editingMessageId == null || !editedMessage)
      return

    const content = editingMessageDraft.trim()

    if (!content || content.length > MAX_MESSAGE_LENGTH || updateMessageMutation.isPending)
      return

    if (content === editedMessage.content) {
      cancelEditMessage()
      return
    }

    try {
      const result = await updateMessageMutation.mutateAsync({
        path: { messageId: editingMessageId },
        body: { content },
      })

      updateActiveChannelChatMessage(result.message)
      cancelEditMessage()
    }
    catch {
    }
  })

  const submitDeleteMessage = useEvent(async (messageId: number) => {
    const message = messages.find(candidate => candidate.serverId === messageId)

    if (!message || message.deliveryStatus !== 'sent' || message.userId !== user?.id || deleteMessageMutation.isPending)
      return

    try {
      await deleteMessageMutation.mutateAsync({
        path: { messageId },
      })

      removeActiveChannelChatMessage(message.channelId, messageId)
      setDeletingMessageId(null)

      if (editingMessageId === messageId)
        cancelEditMessage()
    }
    catch {
    }
  })

  useEffect(() => {
    hydrateChatSession()
  }, [channel.id, initialPage.messages, initialPage.hasMore])

  useEffect(() => {
    cancelEditMessage()
    cancelDeleteMessage()
  }, [channel.id])

  useEffect(() => {
    if (editingMessageId != null && !editedMessage)
      cancelEditMessage()

    if (deletingMessageId != null && !messages.some(message => message.serverId === deletingMessageId))
      cancelDeleteMessage()
  }, [editingMessageId, deletingMessageId, editedMessage, messages])

  useEffect(() => () => clearChatSession(), [channel.id])

  return {
    state: {
      channel,
      editingMessageId,
      editingMessageDraft,
      deletingMessageId,
      canSubmitEditedMessage,
      isLoadingOlderMessages,
      isUpdatingMessage: updateMessageMutation.isPending,
      isDeletingMessage: deleteMessageMutation.isPending,
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
      openEditMessage,
      cancelEditMessage,
      setEditingMessageDraft,
      submitEditMessage,
      requestDeleteMessage,
      cancelDeleteMessage,
      submitDeleteMessage,
    },
    features: {
      i18n,
      input,
    },
  }
}
