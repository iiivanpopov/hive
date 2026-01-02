import { beforeEach, describe, expect, it } from 'vitest'

import { clientMock } from '@/tests/mocks/client.mock'
import { databaseMock } from '@/tests/mocks/database.mock'
import { extractSessionTokenCookie } from '@/tests/utils'

let authCookie: string

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

describe('/', () => {
  it('should create a community', async () => {
    const createInvitationResponse = await clientMock.communities.$post({
      json: {
        name: 'Test Community',
      },
    }, { headers: { Cookie: authCookie } })

    expect(createInvitationResponse.status).toBe(201)

    const body = await createInvitationResponse.json()

    expect(body.community).toMatchObject({
      id: 1,
      name: 'Test Community',
    })

    const membership = await databaseMock.query.communityMembers.findFirst({
      where: {
        communityId: body.community.id,
        userId: 1,
      },
    })

    expect(membership).toBeDefined()

    const communities = await databaseMock.query.communities.findMany()

    expect(communities).toHaveLength(1)
  })
})

describe('/:id', () => {
  it('should delete community', async () => {
    await clientMock.communities.$post({
      json: {
        name: 'Test Community',
      },
    }, { headers: { Cookie: authCookie } })

    const deleteCommunityResponse = await clientMock.communities[':id'].$delete({
      param: { id: '1' },
    }, { headers: { Cookie: authCookie } })

    expect(deleteCommunityResponse.status).toBe(204)

    const communities = await databaseMock.query.communities.findMany()

    expect(communities).toHaveLength(0)
  })

  it('should update community', async () => {
    await clientMock.communities.$post({
      json: {
        name: 'Test Community',
      },
    }, { headers: { Cookie: authCookie } })

    const updateCommunityResponse = await clientMock.communities[':id'].$patch({
      param: { id: '1' },
      json: {
        name: 'Updated Community',
      },
    }, { headers: { Cookie: authCookie } })

    expect(updateCommunityResponse.status).toBe(200)

    const body = await updateCommunityResponse.json()

    expect(body.community).toMatchObject({
      id: 1,
      name: 'Updated Community',
    })

    const community = await databaseMock.query.communities.findFirst({
      where: { name: 'Updated Community' },
    })

    expect(community!.name).toBe('Updated Community')
  })
})

describe('/leave/:id', () => {
  it('should leave a community', async () => {
    await clientMock.communities.$post({
      json: {
        name: 'Test Community',
      },
    }, { headers: { Cookie: authCookie } })

    const createInvitationResponse = await clientMock.communities[':id'].invitations.$post({
      param: { id: '1' },
      json: {},
    }, { headers: { Cookie: authCookie } })

    const { invitation } = await createInvitationResponse.json()

    const response = await clientMock.auth.register.$post({
      json: {
        email: 'testuser2@gmail.com',
        username: 'testuser2',
        password: 'password123',
      },
    })
    authCookie = extractSessionTokenCookie(response.headers)

    await clientMock.communities.join[':token'].$post({
      param: { token: invitation.token },
    }, { headers: { Cookie: authCookie } })

    const leaveCommunityResponse = await clientMock.communities.leave[':id'].$post({
      param: { id: '1' },
    }, { headers: { Cookie: authCookie } })

    expect(leaveCommunityResponse.status).toBe(204)

    const membership = await databaseMock.query.communityMembers.findFirst({
      where: { user: { email: 'testuser2@gmail.com' } },
    })

    expect(membership).toBeUndefined()
  })
})
