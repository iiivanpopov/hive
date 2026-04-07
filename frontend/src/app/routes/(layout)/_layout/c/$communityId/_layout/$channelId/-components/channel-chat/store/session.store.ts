import { createStore } from '@siberiacancode/reactuse'

export interface ChannelChatServerMessage {
  id: number
  channelId: number
  userId: number
  content: string
  createdAt: string
  updatedAt: string
}

export type ChannelChatDeliveryStatus = 'sent' | 'sending' | 'failed'

export interface ActiveChannelChatSessionMessage {
  localId: string
  serverId?: number
  channelId: number
  userId: number
  content: string
  createdAt: string
  updatedAt: string
  deliveryStatus: ChannelChatDeliveryStatus
}

interface ActiveChannelChatSessionState {
  channelId: number | null
  messages: Array<ActiveChannelChatSessionMessage>
  hasOlderMessages: boolean
  isLoadingOlderMessages: boolean
  draft: string
}

interface CreateSendingChannelChatMessageParams {
  channelId: number
  userId: number
  content: string
  clientId: string
  timestamp: string
}

const EMPTY_ACTIVE_CHANNEL_CHAT_MESSAGES: Array<ActiveChannelChatSessionMessage> = []

const EMPTY_ACTIVE_CHANNEL_CHAT_SESSION: ActiveChannelChatSessionState = {
  channelId: null,
  messages: EMPTY_ACTIVE_CHANNEL_CHAT_MESSAGES,
  hasOlderMessages: false,
  isLoadingOlderMessages: false,
  draft: '',
}

const activeChannelChatSessionStore = createStore<ActiveChannelChatSessionState>(
  EMPTY_ACTIVE_CHANNEL_CHAT_SESSION,
)

function dedupeActiveChannelChatMessages(messages: Array<ActiveChannelChatSessionMessage>) {
  const seenLocalIds = new Set<string>()
  const seenServerIds = new Set<number>()

  return messages.filter((message) => {
    if (seenLocalIds.has(message.localId))
      return false

    seenLocalIds.add(message.localId)

    if (message.serverId == null)
      return true

    if (seenServerIds.has(message.serverId))
      return false

    seenServerIds.add(message.serverId)
    return true
  })
}

function hasActiveChannelChatServerMessage(
  messages: Array<ActiveChannelChatSessionMessage>,
  serverId: number,
) {
  return messages.some(message => message.serverId === serverId)
}

export function createSentChannelChatMessage(
  message: ChannelChatServerMessage,
  localId = `server:${message.id}`,
): ActiveChannelChatSessionMessage {
  return {
    localId,
    serverId: message.id,
    channelId: message.channelId,
    userId: message.userId,
    content: message.content,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    deliveryStatus: 'sent',
  }
}

export function isActiveChannelChatMessageEdited(message: Pick<ActiveChannelChatSessionMessage, 'createdAt' | 'updatedAt'>) {
  return message.createdAt !== message.updatedAt
}

export function createSendingChannelChatMessage({
  channelId,
  userId,
  content,
  clientId,
  timestamp,
}: CreateSendingChannelChatMessageParams): ActiveChannelChatSessionMessage {
  return {
    localId: clientId,
    serverId: undefined,
    channelId,
    userId,
    content,
    createdAt: timestamp,
    updatedAt: timestamp,
    deliveryStatus: 'sending',
  }
}

export function mapChannelChatServerMessagesToSessionMessages(
  messages: Array<ChannelChatServerMessage>,
) {
  return [...messages].reverse().map(message => createSentChannelChatMessage(message))
}

export function getOldestChannelChatServerMessageId(
  messages: Array<ActiveChannelChatSessionMessage>,
) {
  return messages.find(message => message.serverId != null)?.serverId
}

export function useActiveChannelChatMessages(channelId: number) {
  return activeChannelChatSessionStore.use(state => state.channelId === channelId
    ? state.messages
    : EMPTY_ACTIVE_CHANNEL_CHAT_MESSAGES)
}

export function useActiveChannelChatDraft(channelId: number) {
  return activeChannelChatSessionStore.use(state => state.channelId === channelId
    ? state.draft
    : '')
}

export function useActiveChannelChatHasOlderMessages(
  channelId: number,
  initialHasOlderMessages: boolean,
) {
  return activeChannelChatSessionStore.use(state => state.channelId === channelId
    ? state.hasOlderMessages
    : initialHasOlderMessages)
}

export function useActiveChannelChatIsLoadingOlderMessages(channelId: number) {
  return activeChannelChatSessionStore.use(state => state.channelId === channelId
    ? state.isLoadingOlderMessages
    : false)
}

export function hydrateActiveChannelChatSession(
  channelId: number,
  serverMessages: Array<ChannelChatServerMessage>,
  hasOlderMessages: boolean,
) {
  activeChannelChatSessionStore.set((state) => {
    const nextMessages = mapChannelChatServerMessagesToSessionMessages(serverMessages)
    const localMessages = state.channelId === channelId
      ? state.messages.filter(message => message.deliveryStatus !== 'sent')
      : EMPTY_ACTIVE_CHANNEL_CHAT_MESSAGES

    return {
      channelId,
      messages: dedupeActiveChannelChatMessages([...nextMessages, ...localMessages]),
      hasOlderMessages,
      isLoadingOlderMessages: false,
      draft: state.channelId === channelId ? state.draft : '',
    }
  })
}

export function prependActiveChannelChatPage(
  channelId: number,
  serverMessages: Array<ChannelChatServerMessage>,
  hasOlderMessages: boolean,
) {
  activeChannelChatSessionStore.set((state) => {
    if (state.channelId !== channelId)
      return state

    const nextMessages = mapChannelChatServerMessagesToSessionMessages(serverMessages)

    return {
      messages: dedupeActiveChannelChatMessages([...nextMessages, ...state.messages]),
      hasOlderMessages,
      isLoadingOlderMessages: false,
    }
  })
}

export function appendOutgoingChannelChatMessage(
  message: ActiveChannelChatSessionMessage,
) {
  activeChannelChatSessionStore.set((state) => {
    if (state.channelId !== message.channelId)
      return state

    return {
      messages: [...state.messages, message],
    }
  })
}

export function receiveChannelChatMessage(
  message: ChannelChatServerMessage,
  clientId?: string,
) {
  activeChannelChatSessionStore.set((state) => {
    if (state.channelId !== message.channelId)
      return state

    if (clientId) {
      const confirmedMessageIndex = state.messages.findIndex(
        existingMessage => existingMessage.localId === clientId,
      )

      if (confirmedMessageIndex !== -1) {
        const nextMessages = [...state.messages]
        nextMessages[confirmedMessageIndex] = createSentChannelChatMessage(message, clientId)

        return { messages: dedupeActiveChannelChatMessages(nextMessages) }
      }
    }

    if (hasActiveChannelChatServerMessage(state.messages, message.id))
      return state

    return {
      messages: [...state.messages, createSentChannelChatMessage(message)],
    }
  })
}

export function updateActiveChannelChatMessage(message: ChannelChatServerMessage) {
  activeChannelChatSessionStore.set((state) => {
    if (state.channelId !== message.channelId)
      return state

    const messageIndex = state.messages.findIndex(existingMessage => existingMessage.serverId === message.id)
    if (messageIndex === -1)
      return state

    const nextMessages = [...state.messages]
    nextMessages[messageIndex] = {
      ...nextMessages[messageIndex],
      serverId: message.id,
      userId: message.userId,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      deliveryStatus: 'sent',
    }

    return { messages: nextMessages }
  })
}

export function removeActiveChannelChatMessage(channelId: number, messageId: number) {
  activeChannelChatSessionStore.set((state) => {
    if (state.channelId !== channelId)
      return state

    const nextMessages = state.messages.filter(message => message.serverId !== messageId)
    if (nextMessages.length === state.messages.length)
      return state

    return { messages: nextMessages }
  })
}

export function markChannelChatMessageFailed(channelId: number, localId: string) {
  activeChannelChatSessionStore.set((state) => {
    if (state.channelId !== channelId)
      return state

    const messageIndex = state.messages.findIndex(message => message.localId === localId)
    if (messageIndex === -1)
      return state

    if (state.messages[messageIndex]?.deliveryStatus !== 'sending')
      return state

    const nextMessages = [...state.messages]
    nextMessages[messageIndex] = {
      ...nextMessages[messageIndex],
      deliveryStatus: 'failed',
    }

    return { messages: nextMessages }
  })
}

export function setActiveChannelChatDraft(channelId: number, draft: string) {
  activeChannelChatSessionStore.set((state) => {
    if (state.channelId !== channelId)
      return state

    return { draft }
  })
}

export function setActiveChannelChatLoadingOlder(
  channelId: number,
  isLoadingOlderMessages: boolean,
) {
  activeChannelChatSessionStore.set((state) => {
    if (state.channelId !== channelId)
      return state

    return { isLoadingOlderMessages }
  })
}

export function clearActiveChannelChatSession() {
  activeChannelChatSessionStore.set(() => EMPTY_ACTIVE_CHANNEL_CHAT_SESSION)
}
