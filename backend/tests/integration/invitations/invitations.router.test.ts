import { beforeEach, describe, expect, it } from 'bun:test'

import { clientMock } from '@/tests/mocks/client.mock'
import { databaseMock } from '@/tests/mocks/database.mock'

let authCookie: string

beforeEach(async () => {
  const response = await clientMock.auth.register.$post({
    json: {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    },
  })
  authCookie = response.headers.getSetCookie()[0].split(';')[0]

  await clientMock.communities.$post({
    json: {
      name: 'Test Community',
    },
  }, { headers: { Cookie: authCookie } })
})

describe('/communities/:id/invitations', () => {
  it('should create a invitation', async () => {
    const createInvitationResponse = await clientMock.communities[':id'].invitations.$post({
      param: { id: '1' },
      json: {},
    }, { headers: { Cookie: authCookie } })

    expect(createInvitationResponse.status).toBe(201)

    const body = await createInvitationResponse.json()

    expect(body.invitation).toMatchObject({
      communityId: 1,
      token: expect.any(String),
      expiresAt: null,
    })

    const invitations = await databaseMock.query.invitations.findMany()

    expect(invitations).toHaveLength(1)
  })
})

describe('/communities/join/:token', () => {
  it('should join a community via invitation', async () => {
    const createInvitationResponse = await clientMock.communities[':id'].invitations.$post({
      param: { id: '1' },
      json: {},
    }, { headers: { Cookie: authCookie } })

    const { invitation } = await createInvitationResponse.json()

    const registerResponse = await clientMock.auth.register.$post({
      json: {
        email: 'testuser2@gmail.com',
        username: 'testuser2',
        password: 'password123',
      },
    })
    authCookie = registerResponse.headers.getSetCookie()[0].split(';')[0]

    const joinInvitationResponse = await clientMock.communities.join[':token'].$post({
      param: { token: invitation.token },
    }, { headers: { Cookie: authCookie } })

    expect(joinInvitationResponse.status).toBe(204)

    const membership = await databaseMock.query.communityMembers.findFirst({
      where: {
        communityId: invitation.communityId,
        userId: 2,
      },
    })

    expect(membership).toBeDefined()
  })
})

describe('/invitations/:id', () => {
  it('should revoke an invitation', async () => {
    const createInvitationResponse = await clientMock.communities[':id'].invitations.$post({
      param: { id: '1' },
      json: {},
    }, { headers: { Cookie: authCookie } })

    const { invitation } = await createInvitationResponse.json()

    const revokeInvitationResponse = await clientMock.invitations[':id'].$delete({
      param: { id: invitation.id.toString() },
    }, { headers: { Cookie: authCookie } })

    expect(revokeInvitationResponse.status).toBe(200)
  })
})
