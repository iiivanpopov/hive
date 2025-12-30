import { redis } from 'bun'
import { beforeAll, expect, test } from 'bun:test'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { testClient } from 'hono/testing'
import { app } from '@/app/entrypoint'
import { db } from '@/db/instance'
import * as schema from '@/db/schema'
import { reset } from '../_utils'

const client = testClient(app)

beforeAll(async () => {
  await redis.send('FLUSHALL', [])
  reset(schema)
  migrate(db, { migrationsFolder: './drizzle' })
})

test('Should register a new user', async () => {
  const response1 = await client.api.auth.register.$post({
    json: {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    },
  })

  expect(response1.status).toBe(204)
})

test('Should not register an existing user', async () => {
  const response = await client.api.auth.register.$post({
    json: {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    },
  })

  expect(await response.json()).toEqual({
    error: {
      code: 'USER_EXISTS',
      message: 'User with given username or email already exists',
    },
  })
  expect(response.status as unknown).toBe(400)
})

test('Should login a user', async () => {
  const response1 = await client.api.auth.login.$post({
    json: {
      identity: 'testuser',
      password: 'password123',
    },
  })

  expect(response1.status).toBe(204)
  expect(response1.headers.get('Set-Cookie')).toBeDefined()
})

test('Should not login with invalid credentials', async () => {
  const response = await client.api.auth.login.$post({
    json: {
      identity: 'testuser',
      password: 'wrongpassword',
    },
  })

  expect(await response.json()).toEqual({
    error: {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid credentials',
    },
  })
  expect(response.status as unknown).toBe(401)
})

test('Should logout a user', async () => {
  const loginResponse = await client.api.auth.login.$post({
    json: {
      identity: 'testuser',
      password: 'password123',
    },
  })

  expect(loginResponse.status).toBe(204)
  const cookie = loginResponse.headers.get('Set-Cookie')
  expect(cookie).toBeDefined()

  const logoutResponse = await client.api.auth.logout.$post({
    headers: {
      Cookie: cookie!,
    },
  })

  expect(logoutResponse.status).toBe(204)
})

test('Should request password reset', async () => {
  const response = await client.api.auth['request-reset'].$post({
    json: {
      email: 'testuser@gmail.com',
    },
  })

  expect(response.status).toBe(204)
})
