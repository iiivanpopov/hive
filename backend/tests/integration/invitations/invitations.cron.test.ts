import { beforeEach, expect, it } from 'vitest'

import { communities } from '@/db/tables/communities'
import { invitations } from '@/db/tables/invitations'
import { users } from '@/db/tables/users'
import { InvitationsCron } from '@/modules/invitations'
import { databaseMock } from '@/tests/mocks/database.mock'

const NOW = new Date('2025-01-01T12:00:00.000Z')

const userPayload = {
  email: 'testuser@gmail.com',
  username: 'testuser',
  passwordHash: await Bun.password.hash('password123'),
}

const communityPayload = {
  name: 'Test Community',
  slug: 'test-community',
}

beforeEach(async () => {
  await databaseMock
    .insert(users)
    .values(userPayload)
})

it('should delete only expired invitations', async () => {
  const user = await databaseMock.query.users.findFirst({
    where: { email: userPayload.email },
  })

  const [community] = await databaseMock
    .insert(communities)
    .values({
      ...communityPayload,
      ownerId: user!.id,
    })
    .returning()

  await databaseMock.insert(invitations).values([
    {
      communityId: community.id,
      token: 'expired-invitation',
      expiresAt: new Date(NOW.getTime() - 60_000),
    },
    {
      communityId: community.id,
      token: 'valid-invitation',
      expiresAt: new Date(NOW.getTime() + 60_000),
    },
  ])

  const cron = new InvitationsCron(databaseMock)

  const deletedCount = await cron.deleteExpiredInvitations(NOW)

  expect(deletedCount).toBe(1)

  const remainingInvitations = await databaseMock.query.invitations.findMany({
    where: { communityId: community.id },
  })

  expect(remainingInvitations).toHaveLength(1)
  expect(remainingInvitations[0].token).toBe('valid-invitation')
})
