import { createStore } from '@siberiacancode/reactuse'

export interface ServerMessage {
  id: number
  channelId: number
  userId: number
  content: string
  createdAt: string
  updatedAt: string
}

export interface ChannelChatMessage extends Omit<ServerMessage, 'id'> {
  id: number | string
  clientId?: string
  optimistic: boolean
  failed: boolean
}

interface ChannelChatStoreState {
  channelId: number | null
  messages: Array<ChannelChatMessage>
}

const EMPTY_MESSAGES: Array<ChannelChatMessage> = []

const channelChatStore = createStore<ChannelChatStoreState>({
  channelId: null,
  messages: EMPTY_MESSAGES,
})

export function useChannelChatMessages(channelId: number) {
  return channelChatStore.use(state => state.channelId === channelId ? state.messages : EMPTY_MESSAGES)
}

export function appendChannelChatMessage(message: ChannelChatMessage) {
  channelChatStore.set((state) => {
    if (state.channelId !== message.channelId || state.messages.some(existingMessage => existingMessage.id === message.id))
      return state

    return { messages: [...state.messages, message] }
  })
}

export function hydrateChannelChatState(channelId: number, messages: Array<ChannelChatMessage>) {
  channelChatStore.set((state) => {
    const optimisticMessages = state.channelId === channelId
      ? state.messages.filter(existingMessage => existingMessage.optimistic)
      : EMPTY_MESSAGES

    return {
      channelId,
      messages: [...messages, ...optimisticMessages],
    }
  })
}

export function appendServerChannelChatMessage(message: ChannelChatMessage, clientId?: string) {
  channelChatStore.set((state) => {
    if (state.channelId !== message.channelId)
      return state

    const nextMessages = state.messages.filter(existingMessage =>
      existingMessage.id !== message.id
      && (!clientId || existingMessage.clientId !== clientId),
    )

    return { messages: [...nextMessages, message] }
  })
}

export function markChannelChatMessageFailed(channelId: number, clientId: string) {
  channelChatStore.set((state) => {
    if (state.channelId !== channelId)
      return state

    const messageIndex = state.messages.findIndex(existingMessage => existingMessage.clientId === clientId)

    if (messageIndex === -1)
      return state

    const nextMessages = [...state.messages]
    nextMessages[messageIndex] = {
      ...nextMessages[messageIndex],
      optimistic: false,
      failed: true,
    }

    return { messages: nextMessages }
  })
}

export function resetChannelChatState(channelId: number | null) {
  channelChatStore.set((state) => {
    if (state.channelId === channelId && state.messages.length === 0)
      return state

    return {
      channelId,
      messages: EMPTY_MESSAGES,
    }
  })
}
