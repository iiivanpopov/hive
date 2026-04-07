import type { WSContext } from 'hono/ws'

import type { WsResponse } from './utils/websocket-message'

export class ChannelBroadcastService {
  private readonly connections = new Map<number, Set<WSContext>>()

  addConnection(channelId: number, connection: WSContext) {
    const connections = this.connections.get(channelId) ?? new Set<WSContext>()

    connections.add(connection)
    this.connections.set(channelId, connections)
  }

  removeConnection(channelId: number, connection: WSContext) {
    const connections = this.connections.get(channelId)
    if (!connections)
      return

    connections.delete(connection)

    if (connections.size === 0)
      this.connections.delete(channelId)
  }

  broadcast(channelId: number, message: WsResponse<unknown>) {
    const connections = this.connections.get(channelId)
    if (!connections)
      return

    const serializedMessage = JSON.stringify(message)

    for (const connection of connections)
      connection.send(serializedMessage)
  }
}
