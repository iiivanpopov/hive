import { afterEach, beforeAll, describe, expect, test } from 'bun:test'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { testClient } from 'hono/testing'
import { parse as parseCookie } from 'hono/utils/cookie'
import path from 'node:path'

import type { MailOptions } from '@/lib/mail'

import { users } from '@/db/schema'
import { createApp } from '@/tests/_utils/create-app'
import { memoryDatabase, resetDatabase } from '@/tests/_utils/database'
import { memoryCache } from '@/tests/_utils/memory-cache'

const client = testClient(createApp())

beforeAll(async () => {
  migrate(memoryDatabase, { migrationsFolder: path.resolve(__dirname, '../../drizzle') })
})

afterEach(() => {
  resetDatabase(memoryDatabase, { users })
  memoryCache.reset()
})

test('Should register a new user', async () => {
  const response1 = await client.auth.register.$post({
    json: {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    },
  })

  expect(response1.status).toBe(204)
  expect(response1.headers.get('Set-Cookie')).toBeDefined()

  const cookie = parseCookie(response1.headers.get('Set-Cookie')!, 'session_token')
  expect(cookie).toBeDefined()
  expect(cookie.session_token).toHaveLength(36)
})

test('Should not register an existing user', async () => {
  const response1 = await client.auth.register.$post({
    json: {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    },
  })

  expect(response1.status).toBe(204)
  expect(response1.headers.get('Set-Cookie')).toBeDefined()

  const response2 = await client.auth.register.$post({
    json: {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    },
  })

  expect(await response2.json()).toMatchObject({
    error: {
      code: 'USER_EXISTS',
    },
  })
  expect(response2.status as unknown).toBe(400)
})

test('Should not login with invalid credentials', async () => {
  const response = await client.auth.login.$post({
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

test('Should login a user', async () => {
  await client.auth.register.$post({
    json: {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    },
  })

  const response2 = await client.auth.login.$post({
    json: {
      identity: 'testuser',
      password: 'password123',
    },
  })

  expect(response2.status).toBe(204)
  expect(response2.headers.get('Set-Cookie')).toBeDefined()

  const cookie = parseCookie(response2.headers.get('Set-Cookie')!, 'session_token')
  expect(cookie).toBeDefined()
  expect(cookie.session_token).toHaveLength(36)
})

test('Should logout a user', async () => {
  const response1 = await client.auth.logout.$post()

  expect(response1.status).toBe(204)
  expect(response1.headers.get('Set-Cookie')).toBeDefined()
})

test('Should request password reset', async () => {
  await client.auth.register.$post({
    json: {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    },
  })

  const response2 = await client.auth['request-reset'].$post({
    json: {
      email: 'testuser@gmail.com',
    },
  })

  expect(response2.status).toBe(204)

  const lastEmail = await memoryCache.get('testuser@gmail.com' + '-last-email').then(data => data ? JSON.parse(data) as MailOptions : null)
  expect(lastEmail).not.toBeNull()

  const passwordResetToken = lastEmail!.html.match(/[?&]token=([^"&]+)/)?.[1]
  expect(passwordResetToken).toHaveLength(36)
})

test('Should return 204 for non-existent email', async () => {
  const response = await client.auth['request-reset'].$post({
    json: {
      email: 'testuser@gmail.com',
    },
  })

  expect(response.status).toBe(204)
})

test('Should reject after exceeding maximum retry attempts for existing account', async () => {
  await client.auth.register.$post({
    json: {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    },
  })

  for (let i = 0; i < 5; i++) {
    await client.auth['request-reset'].$post({
      json: {
        email: 'testuser@gmail.com',
      },
    })
  }

  const response = await client.auth['request-reset'].$post({
    json: {
      email: 'testuser@gmail.com',
    },
  })
  expect(await response.json()).toMatchObject({
    error: {
      code: 'TOO_MANY_PASSWORD_RESET_ATTEMPTS',
    },
  })
  expect(response.status as unknown).toBe(429)
})

test('Should not reject after exceeding maximum retry attempts for not existing account', async () => {
  for (let i = 0; i < 5; i++) {
    await client.auth['request-reset'].$post({
      json: {
        email: 'testuser@gmail.com',
      },
    })
  }

  const response = await client.auth['request-reset'].$post({
    json: {
      email: 'testuser@gmail.com',
    },
  })

  expect(response.status as unknown).toBe(204)
})

describe('/change-password', () => {
  test('Should change password', async () => {
    const client = testClient(createApp())

    const loginResponse = await client.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    const sessionTokenCookie = parseCookie(loginResponse.headers.get('Set-Cookie')!, 'session_token')

    const changePasswordResponse = await client.auth['change-password'].$patch(
      {
        json: {
          currentPassword: 'password123',
          newPassword: 'newpassword456',
        },
      },
      {
        headers: {
          Cookie: `session_token=${sessionTokenCookie.session_token}`,
        },
      },
    )

    expect(changePasswordResponse.status).toBe(204)
  })

  test('Should not change password with invalid current password', async () => {
    const registerResponse = await client.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },

    })

    const cookie = parseCookie(registerResponse.headers.get('Set-Cookie')!, 'session_token')

    const response = await client.auth['change-password'].$patch(
      {
        json: {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword456',
        },
      },
      {
        headers: {
          Cookie: `session_token=${cookie.session_token}`,
        },
      },
    )

    expect(response.status as unknown).toBe(401)
    expect(await response.json()).toMatchObject({
      error: {
        code: 'INVALID_CURRENT_PASSWORD',
      },
    })
  })
})
