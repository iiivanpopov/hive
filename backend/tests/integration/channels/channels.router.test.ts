import { beforeEach, describe, expect, it } from 'vitest'

import { clientMock } from '@/tests/mocks/client.mock'
import { databaseMock } from '@/tests/mocks/database.mock'
import { extractSessionTokenCookie } from '@/tests/utils'

let authCookie: string

async function seedChannel() {
  await clientMock.communities[':communityId'].channels.$post({
    json: {
      name: 'General',
      description: 'General discussion',
    },
    param: { communityId: '1' },
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

  await clientMock.communities.$post({
    json: {
      name: 'Test Community',
    },
  }, { headers: { Cookie: authCookie } })
})

describe('/communities/:id/channels', () => {
  it('should create a channel in the community', async () => {
    const createChannelResponse = await clientMock.communities[':communityId'].channels.$post({
      json: {
        name: 'General',
        description: 'General discussion',
      },
      param: { communityId: '1' },
    }, { headers: { Cookie: authCookie } })

    expect(createChannelResponse.status).toBe(201)

    const body = await createChannelResponse.json()

    expect(body.channel).toMatchObject({
      id: 1,
      communityId: 1,
      name: 'General',
      description: 'General discussion',
    })

    const channel = await databaseMock.query.channels.findFirst({
      where: { communityId: 1 },
    })

    expect(channel).toBeDefined()
    expect(channel).toMatchObject({
      id: 1,
      communityId: 1,
      name: 'General',
      description: 'General discussion',
    })
  })

  it('should get channels in the community', async () => {
    await seedChannel()

    const getChannelsResponse = await clientMock.communities[':communityId'].channels.$get({
      param: { communityId: '1' },
    }, { headers: { Cookie: authCookie } })

    expect(getChannelsResponse.status).toBe(200)

    const body = await getChannelsResponse.json()

    expect(body.channels).toHaveLength(1)
    expect(body.channels[0]).toMatchObject({
      id: 1,
      communityId: 1,
      name: 'General',
      description: 'General discussion',
    })
  })
})

describe('/channels/:communityId/:channelId', () => {
  it('should delete a channel', async () => {
    await seedChannel()

    const deleteChannelResponse = await clientMock.channels[':channelId'].$delete({
      param: { channelId: '1' },
    }, { headers: { Cookie: authCookie } })

    expect(deleteChannelResponse.status).toBe(200)

    const channel = await databaseMock.query.channels.findFirst({
      where: { id: 1 },
    })

    expect(channel).toBeUndefined()
  })

  it('should update a channel', async () => {
    await seedChannel()

    const updateChannelResponse = await clientMock.channels[':channelId'].$patch({
      json: {
        name: 'Updated General',
        description: 'Updated general discussion',
      },
      param: { channelId: '1' },
    }, { headers: { Cookie: authCookie } })

    expect(updateChannelResponse.status).toBe(200)

    const channel = await databaseMock.query.channels.findFirst({
      where: { id: 1 },
    })

    expect(channel).toBeDefined()
    expect(channel).toMatchObject({
      id: 1,
      communityId: 1,
      name: 'Updated General',
      description: 'Updated general discussion',
    })
  })
})
