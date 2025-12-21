import { beforeAll, expect, test } from 'bun:test'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { testClient } from 'hono/testing'
import { app } from '@/app/entrypoint'
import { reset } from '@/db/helpers'
import { db } from '@/db/instance'
import * as schema from '@/db/schema'

const client = testClient(app)

beforeAll(() => {
  reset(schema)
  migrate(db, { migrationsFolder: './drizzle' })
})

test('/auth/register', async () => {
  const response1 = await client.api.auth.register.$post({
    json: {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    },
  })

  expect(response1.status).toBe(204)

  const response2 = await client.api.auth.register.$post({
    json: {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    },
  })

  expect(await response2.json()).toEqual({
    error: {
      code: 'USER_EXISTS',
      message: 'User with given username or email already exists',
    },
  })
  expect(response2.status as unknown).toBe(400)
})
