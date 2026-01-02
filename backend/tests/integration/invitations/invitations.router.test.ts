import { afterEach, beforeAll, beforeEach, describe, expect, expectTypeOf, it } from 'bun:test'

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
    expectTypeOf(invitation.token).toBeString()
    expect(invitation).toHaveProperty('expiresAt')
  })
})

describe('/join/:token', () => {
  it('should join a community via invitation', async () => {
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
        json: {},
      },
      {
        headers: {
          Cookie: authCookie,
        },
      },
    )
    expect(createInvitationResponse.status).toBe(201)
    const { invitation } = await createInvitationResponse.json()

    const registerResponse = await client.auth.register.$post({
      json: {
        email: 'testuser2@gmail.com',
        username: 'testuser2',
        password: 'password123',
      },
    })

    authCookie = getSessionTokenCookie(registerResponse)!

    const joinInvitationResponse = await client.join[':token'].$post(
      {
        param: {
          token: invitation.token,
        },
      },
      {
        headers: {
          Cookie: authCookie,
        },
      },
    )

    expect(joinInvitationResponse.status).toBe(204)
  })
})

describe('/invitations/:id', () => {
  it('should revoke an invitation', async () => {
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
        json: {},
      },
      {
        headers: {
          Cookie: authCookie,
        },
      },
    )
    expect(createInvitationResponse.status).toBe(201)
    const { invitation } = await createInvitationResponse.json()

    const revokeInvitationResponse = await client.invitations[':id'].$delete(
      {
        param: {
          id: String(invitation.id),
        },
      },
      {
        headers: {
          Cookie: authCookie,
        },
      },
    )

    expect(revokeInvitationResponse.status).toBe(200)
    const { invitation: revokedInvitation } = await revokeInvitationResponse.json()
    expect(revokedInvitation.id).toBe(invitation.id)
  })
})
