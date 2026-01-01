import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import path from 'node:path'

import { communities, communityMembers, invitations, users } from '@/db/schema'

import { client } from '../_utils/client'
import { getSessionTokenCookie } from '../_utils/cookies'
import { memoryDatabase, resetDatabase } from '../_utils/database'
import { memoryCache } from '../_utils/memory-cache'

let authCookie: string

beforeAll(async () => {
  migrate(memoryDatabase, { migrationsFolder: path.resolve(__dirname, '../../drizzle') })
})

afterEach(() => {
  resetDatabase(memoryDatabase, {
    users,
    communities,
    communityMembers,
    communityJoinLinks: invitations,
  })
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
})
