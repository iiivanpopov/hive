import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test'

import { client } from '@/tests/_utils/client'
import { getSessionTokenCookie } from '@/tests/_utils/cookies'
import { memoryDatabase, migrateDatabase, resetDatabase } from '@/tests/_utils/database'
import { memoryCache } from '@/tests/_utils/memory-cache'

let authCookie: string

beforeAll(() => {
  migrateDatabase(memoryDatabase)
})

afterEach(() => {
  resetDatabase(memoryDatabase)
  memoryCache.reset()
})

beforeEach(async () => {
  const registerResponse = await client.auth.register.$post({
    json: {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    },
  })

  authCookie = getSessionTokenCookie(registerResponse)!
})

describe('/', () => {
  it('should create a community', async () => {
    const createCommunityResponse = await client.communities.$post(
      {
        json: {
          name: 'Test Community',
        },
      },
      {
        headers: {
          Cookie: authCookie,
        },
      },
    )

    expect(createCommunityResponse.status).toBe(201)
  })

  it('should not create a community with same name for same user', async () => {
    await client.communities.$post(
      {
        json: {
          name: 'Test Community',
        },
      },
      {
        headers: {
          Cookie: authCookie,
        },
      },
    )

    const createCommunityResponseIncorrect = await client.communities.$post(
      {
        json: {
          name: 'Test Community',
        },
      },
      {
        headers: {
          Cookie: authCookie,
        },
      },
    )

    expect(createCommunityResponseIncorrect.status as unknown).toBe(400)
    expect((await createCommunityResponseIncorrect.json())).toMatchObject({
      error: {
        code: 'COMMUNITY_EXISTS',
      },
    })
  })
})

describe('/:id', () => {
  it('should delete a community', async () => {
    const createCommunityResponse = await client.communities.$post(
      {
        json: {
          name: 'Test community',
        },
      },
      {
        headers: {
          Cookie: authCookie,
        },
      },
    )

    const { community } = await createCommunityResponse.json()

    const deleteCommunityResponse = await client.communities[':id'].$delete(
      {
        param: {
          id: `${community.id}`,
        },
      },
      {
        headers: {
          Cookie: authCookie,
        },
      },
    )

    expect(deleteCommunityResponse.status).toBe(204)
  })

  it('should update a community', async () => {
    const createCommunityResponse = await client.communities.$post(
      {
        json: {
          name: 'Initial Community Name',
        },
      },
      {
        headers: {
          Cookie: authCookie,
        },
      },
    )

    const { community } = await createCommunityResponse.json()

    const updateCommunityResponse = await client.communities[':id'].$patch(
      {
        param: {
          id: `${community.id}`,
        },
        json: {
          name: 'Updated Community Name',
        },
      },
      {
        headers: {
          Cookie: authCookie,
        },
      },
    )

    expect(updateCommunityResponse.status).toBe(200)

    const updatedCommunityData = await updateCommunityResponse.json()
    expect(updatedCommunityData.community.name).toBe('Updated Community Name')
  })
})
