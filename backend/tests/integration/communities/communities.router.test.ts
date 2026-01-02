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

describe('/joined', () => {
  it('should get joined communities', async () => {
    await clientMock.communities.$post({
      json: {
        name: 'Test Community',
      },
    }, { headers: { Cookie: authCookie } })

    await clientMock.communities.$post({
      json: {
        name: 'Test Community 2',
      },
    }, { headers: { Cookie: authCookie } })

    const getJoinedCommunitiesResponse = await clientMock.communities.joined.$get({}, { headers: { Cookie: authCookie } })

    expect(getJoinedCommunitiesResponse.status).toBe(200)

    const body = await getJoinedCommunitiesResponse.json()

    expect(body.communities).toHaveLength(2)
    expect(body.communities[0]).toMatchObject({
      id: 1,
      name: 'Test Community',
    })
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

  it('should get community members', async () => {
    await clientMock.communities.$post({
      json: {
        name: 'Test Community',
      },
    }, { headers: { Cookie: authCookie } })

    const getCommunityMembersResponse = await clientMock.communities[':id'].members.$get({
      param: { id: '1' },
    }, { headers: { Cookie: authCookie } })

    expect(getCommunityMembersResponse.status).toBe(200)

    const body = await getCommunityMembersResponse.json()

    expect(body.members).toHaveLength(1)
    expect(body.members[0]).toMatchObject({
      id: 1,
      username: 'testuser',
    })
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
