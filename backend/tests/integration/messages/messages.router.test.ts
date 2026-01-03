import { beforeEach, describe, expect, it } from 'vitest'

import { clientMock } from '@/tests/mocks/client.mock'
import { databaseMock } from '@/tests/mocks/database.mock'
import { extractSessionTokenCookie } from '@/tests/utils'

let authCookie: string

async function seedChannel() {
  await clientMock.communities.$post({
    json: {
      name: 'Test Community',
    },
  }, { headers: { Cookie: authCookie } })

  await clientMock.communities[':id'].channels.$post({
    json: {
      name: 'General',
      description: 'General discussion',
      type: 'text',
    },
    param: { id: '1' },
  }, { headers: { Cookie: authCookie } })
}

beforeEach(async () => {
  const response = await clientMock.auth.register.$post({
    json: {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    },
  })

  authCookie = extractSessionTokenCookie(response.headers)
})

describe('/messages', () => {
  it('should create a message', async () => {
    await seedChannel()

    const createMessageResponse = await clientMock.channels[':id'].messages.$post({
      param: { id: '1' },
      json: {
        content: 'Hello world',
      },
    }, { headers: { Cookie: authCookie } })

    expect(createMessageResponse.status).toBe(201)

    const body = await createMessageResponse.json()

    expect(body.message).toMatchObject({
      id: 1,
      channelId: 1,
      userId: 1,
      content: 'Hello world',
    })

    const message = await databaseMock.query.messages.findFirst({
      where: { id: 1 },
    })

    expect(message).toBeDefined()
    expect(message?.content).toBe('Hello world')
  })
})

describe('/channels/:id/messages', () => {
  it('should get channel messages', async () => {
    await seedChannel()

    await clientMock.channels[':id'].messages.$post({
      param: { id: '1' },
      json: {
        content: 'First message',
      },
    }, { headers: { Cookie: authCookie } })

    const getMessagesResponse = await clientMock.channels[':id'].messages.$get({
      param: { id: '1' },
    }, { headers: { Cookie: authCookie } })

    expect(getMessagesResponse.status).toBe(200)

    const body = await getMessagesResponse.json()

    expect(body.messages).toHaveLength(1)
    expect(body.messages[0]).toMatchObject({
      id: 1,
      channelId: 1,
      userId: 1,
      content: 'First message',
    })
  })
})

describe('/messages/:id', () => {
  it('should update a message', async () => {
    await seedChannel()

    await clientMock.channels[':id'].messages.$post({
      param: { id: '1' },
      json: {
        content: 'Original message',
      },
    }, { headers: { Cookie: authCookie } })

    const updateMessageResponse = await clientMock.messages[':id'].$patch({
      param: { id: '1' },
      json: {
        content: 'Updated message',
      },
    }, { headers: { Cookie: authCookie } })

    expect(updateMessageResponse.status).toBe(200)

    const body = await updateMessageResponse.json()

    expect(body.message).toMatchObject({
      id: 1,
      content: 'Updated message',
    })

    const message = await databaseMock.query.messages.findFirst({
      where: { id: 1 },
    })

    expect(message?.content).toBe('Updated message')
  })

  it('should delete a message', async () => {
    await seedChannel()

    await clientMock.channels[':id'].messages.$post({
      param: { id: '1' },
      json: {
        content: 'Message to delete',
      },
    }, { headers: { Cookie: authCookie } })

    const deleteMessageResponse = await clientMock.messages[':id'].$delete({
      param: { id: '1' },
    }, { headers: { Cookie: authCookie } })

    expect(deleteMessageResponse.status).toBe(204)

    const message = await databaseMock.query.messages.findFirst({
      where: { id: 1 },
    })

    expect(message).toBeUndefined()
  })
})
