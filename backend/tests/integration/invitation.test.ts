import { afterEach, beforeAll, beforeEach, describe, expect, expectTypeOf, it } from 'bun:test'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import path from 'node:path'

import { communities } from '@/db/tables/communities'
import { communityMembers } from '@/db/tables/community-members'
import { invitations } from '@/db/tables/invitations'
import { users } from '@/db/tables/users'

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
    invitations,
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

describe('/communities/:communityId/invitations', () => {
  it('should create a community invitation', async () => {
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
    const { community } = await createCommunityResponse.json()

    const createInvitationResponse = await client.communities[':communityId'].invitations.$post(
      {
        param: {
          communityId: String(community.id),
        },
        json: {
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
      {
        headers: {
          Cookie: authCookie,
        },
      },
    )
    const { invitation } = await createInvitationResponse.json()

    expect(createInvitationResponse.status).toBe(201)
    expect(invitation).toHaveProperty('id')
    expectTypeOf(invitation.link).toBeString()
    expect(invitation).toHaveProperty('expiresAt')
  })
})
