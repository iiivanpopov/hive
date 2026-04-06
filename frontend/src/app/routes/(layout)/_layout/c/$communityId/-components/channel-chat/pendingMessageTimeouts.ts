import { markChannelChatMessageFailed } from './store/session.store'

const MESSAGE_ACK_TIMEOUT = 10_000
const pendingMessageTimeouts = new Map<string, number>()

export function clearPendingMessageTimeout(clientId?: string) {
  if (!clientId)
    return

  const timeoutId = pendingMessageTimeouts.get(clientId)
  if (!timeoutId)
    return

  clearTimeout(timeoutId)
  pendingMessageTimeouts.delete(clientId)
}

export function clearPendingMessageTimeouts() {
  pendingMessageTimeouts.forEach(clearTimeout)
  pendingMessageTimeouts.clear()
}

export function schedulePendingMessageTimeout(channelId: number, clientId: string) {
  clearPendingMessageTimeout(clientId)

  const timeoutId = setTimeout(() => {
    pendingMessageTimeouts.delete(clientId)
    markChannelChatMessageFailed(channelId, clientId)
  }, MESSAGE_ACK_TIMEOUT)

  pendingMessageTimeouts.set(clientId, timeoutId)
}
