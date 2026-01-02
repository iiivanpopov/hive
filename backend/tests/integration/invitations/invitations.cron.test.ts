import { afterEach, beforeAll, beforeEach, expect, test } from 'bun:test'

import { communities } from '@/db/tables/communities'
import { invitations } from '@/db/tables/invitations'
import { InvitationsCron } from '@/modules/invitations/invitations.cron'
import { client } from '@/tests/_utils/client'
import { memoryDatabase, migrateDatabase, resetDatabase } from '@/tests/_utils/database'
import { memoryCache } from '@/tests/_utils/memory-cache'

beforeAll(() => {
  migrateDatabase(memoryDatabase)
})

afterEach(() => {
  resetDatabase(memoryDatabase)
  memoryCache.reset()
})

beforeEach(async () => {
  await client.auth.register.$post({
    json: {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    },
  })
})

test('should delete only expired invitations', async () => {
  const user = await memoryDatabase.query.users.findFirst()

  const [community] = await memoryDatabase
    .insert(communities)
    .values({
      name: 'Test Community',
      ownerId: user!.id,
    })
    .returning()

  await memoryDatabase
    .insert(invitations)
    .values({
      communityId: community.id,
      token: 'expired-invitation',
      expiresAt: new Date(Date.now() - 1000 * 60), // expired 1 minute ago
    })

  const cron = new InvitationsCron(memoryDatabase)
  const deletedCount = await cron.deleteExpiredInvitations()

  expect(deletedCount).toBe(1)
})
