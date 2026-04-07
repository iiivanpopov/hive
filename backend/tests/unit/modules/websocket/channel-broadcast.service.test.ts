import type { WSContext } from 'hono/ws'

import { describe, expect, it } from 'bun:test'

import { ChannelBroadcastService } from '@/modules/websocket/channel-broadcast.service'
import { UpdatedMessageResponse } from '@/modules/websocket/utils/websocket-message'

function createConnection(messages: Array<string>) {
  return {
    send: (message: string) => {
      messages.push(message)
    },
  } as unknown as WSContext
}

function createUpdatedMessageResponse() {
  return new UpdatedMessageResponse({
    id: 1,
    channelId: 1,
    userId: 2,
    content: 'Updated message',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:01.000Z'),
  })
}

describe('ChannelBroadcastService', () => {
  it('broadcasts only to connections in the target channel', () => {
    const service = new ChannelBroadcastService()
    const firstChannelMessages: Array<string> = []
    const secondChannelMessages: Array<string> = []

    service.addConnection(1, createConnection(firstChannelMessages))
    service.addConnection(2, createConnection(secondChannelMessages))
    service.broadcast(1, createUpdatedMessageResponse())

    expect(firstChannelMessages).toHaveLength(1)
    expect(secondChannelMessages).toHaveLength(0)
    expect(JSON.parse(firstChannelMessages[0]!)).toMatchObject({
      type: 'UPDATE_MESSAGE',
      payload: {
        id: 1,
        channelId: 1,
        userId: 2,
        content: 'Updated message',
      },
    })
  })

  it('stops broadcasting to removed connections', () => {
    const service = new ChannelBroadcastService()
    const messages: Array<string> = []
    const connection = createConnection(messages)

    service.addConnection(1, connection)
    service.removeConnection(1, connection)
    service.broadcast(1, createUpdatedMessageResponse())

    expect(messages).toHaveLength(0)
  })
})
