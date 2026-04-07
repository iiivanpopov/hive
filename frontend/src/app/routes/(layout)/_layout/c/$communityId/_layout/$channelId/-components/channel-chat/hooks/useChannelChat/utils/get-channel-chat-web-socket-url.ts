import { env } from '@/config/env'

export function getChannelChatWebSocketUrl(channelId: number) {
  const url = new URL('/ws', env.apiUrl)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.searchParams.set('channelId', String(channelId))
  return url.toString()
}
