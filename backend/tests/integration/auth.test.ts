import { afterEach, beforeAll, describe, expect, it as test } from 'bun:test'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { testClient } from 'hono/testing'
import { parse as parseCookie } from 'hono/utils/cookie'
import path from 'node:path'

import type { MailOptions } from '@/lib/mail'

import { users } from '@/db/schema'
import { createApp } from '@/tests/_utils/create-app'
import { memoryCache } from '@/tests/_utils/memory-cache'

import { client } from '../_utils/client'
import { memoryDatabase, resetDatabase } from '../_utils/database'

beforeAll(async () => {
  migrate(memoryDatabase, { migrationsFolder: path.resolve(__dirname, '../../drizzle') })
})

afterEach(() => {
  resetDatabase(memoryDatabase, { users })
  memoryCache.reset()
})

describe('/register', () => {
  test('should register a new user', async () => {
    const responseRegister = await client.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    expect(responseRegister.status).toBe(204)
    expect(responseRegister.headers.get('Set-Cookie')).toBeDefined()

    const cookie = parseCookie(responseRegister.headers.get('Set-Cookie')!, 'session_token')
    expect(cookie).toBeDefined()
    expect(cookie.session_token).toHaveLength(36)
  })

  test('should not register an existing user', async () => {
    const responseRegister = await client.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    expect(responseRegister.status).toBe(204)
    expect(responseRegister.headers.get('Set-Cookie')).toBeDefined()

    const responseRegisterIncorrect = await client.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    expect(await responseRegisterIncorrect.json()).toMatchObject({
      error: {
        code: 'USER_EXISTS',
      },
    })
    expect(responseRegisterIncorrect.status as unknown).toBe(400)
  })
})

describe('/confirm-email', () => {
  test('should confirm email with valid token', async () => {
    const responseRegister = await client.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })
    expect(responseRegister.status).toBe(204)

    const lastEmail = JSON.parse((await memoryCache.get('testuser@gmail.com' + '-last-email'))!)
    const emailConfirmationToken = lastEmail!.html.match(/[?&]token=([^"&]+)/)?.[1]

    const responseConfirmEmail = await client.auth['confirm-email'][':token'].$post({
      param: {
        token: emailConfirmationToken!,
      },
    })

    expect(responseConfirmEmail.status).toBe(204)
  })

  test('should resend confirmation email', async () => {
    await client.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    const responseResendConfirmation = await client.auth['confirm-email'].resend.$post({
      json: {
        email: 'testuser@gmail.com',
      },
    })

    expect(responseResendConfirmation.status).toBe(204)

    const lastEmail = JSON.parse((await memoryCache.get('testuser@gmail.com' + '-last-email'))!)

    const emailConfirmationToken = lastEmail!.html.match(/[?&]token=([^"&]+)/)?.[1]

    expect(emailConfirmationToken).toHaveLength(36)
  })

  test('should rate limit resend confirmation email', async () => {
    await client.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    for (let i = 0; i < 5; i++) {
      await client.auth['confirm-email'].resend.$post({
        json: {
          email: 'testuser@gmail.com',
        },
      })
    }

    const responseResendConfirmation = await client.auth['confirm-email'].resend.$post({
      json: {
        email: 'testuser@gmail.com',
      },
    })
    expect(responseResendConfirmation.status as unknown).toBe(429)
  })
})

describe('/login', () => {
  test('should not login with invalid credentials', async () => {
    const responseLoginIncorrect = await client.auth.login.$post({
      json: {
        identity: 'testuser',
        password: 'wrongpassword',
      },
    })

    expect(await responseLoginIncorrect.json()).toEqual({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      },
    })
    expect(responseLoginIncorrect.status as unknown).toBe(401)
  })

  test('should login a user', async () => {
    await client.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    const responseLogin = await client.auth.login.$post({
      json: {
        identity: 'testuser',
        password: 'password123',
      },
    })

    expect(responseLogin.status).toBe(204)
    expect(responseLogin.headers.get('Set-Cookie')).toBeDefined()

    const cookie = parseCookie(responseLogin.headers.get('Set-Cookie')!, 'session_token')
    expect(cookie).toBeDefined()
    expect(cookie.session_token).toHaveLength(36)
  })
})

describe('/logout', () => {
  test('should logout a user', async () => {
    const responseLogout = await client.auth.logout.$post()

    expect(responseLogout.status).toBe(204)
    expect(responseLogout.headers.get('Set-Cookie')).toBeDefined()
  })
})

describe('/request-reset', () => {
  test('should request password reset', async () => {
    await client.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    const responseRequestReset = await client.auth['request-reset'].$post({
      json: {
        email: 'testuser@gmail.com',
      },
    })

    expect(responseRequestReset.status).toBe(204)

    const lastEmail = await memoryCache.get('testuser@gmail.com' + '-last-email').then(data => data ? JSON.parse(data) as MailOptions : null)
    expect(lastEmail).not.toBeNull()

    const passwordResetToken = lastEmail!.html.match(/[?&]token=([^"&]+)/)?.[1]
    expect(passwordResetToken).toHaveLength(36)
  })

  test('should return 204 for non-existent email', async () => {
    const responseRequestReset = await client.auth['request-reset'].$post({
      json: {
        email: 'testuser@gmail.com',
      },
    })

    expect(responseRequestReset.status).toBe(204)
  })

  test('should reject after exceeding maximum retry attempts for existing account', async () => {
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

    const responseRequestReset = await client.auth['request-reset'].$post({
      json: {
        email: 'testuser@gmail.com',
      },
    })
    expect(await responseRequestReset.json()).toMatchObject({
      error: {
        code: 'TOO_MANY_PASSWORD_RESET_ATTEMPTS',
      },
    })
    expect(responseRequestReset.status as unknown).toBe(429)
  })

  test('should not reject after exceeding maximum retry attempts for not existing account', async () => {
    for (let i = 0; i < 5; i++) {
      await client.auth['request-reset'].$post({
        json: {
          email: 'testuser@gmail.com',
        },
      })
    }

    const responseRequestReset = await client.auth['request-reset'].$post({
      json: {
        email: 'testuser@gmail.com',
      },
    })

    expect(responseRequestReset.status as unknown).toBe(204)
  })
})

describe('/reset-password', () => {
  test('should reset password with valid token', async () => {
    await client.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    await client.auth['request-reset'].$post({
      json: {
        email: 'testuser@gmail.com',
      },
    })

    const lastEmail = JSON.parse((await memoryCache.get('testuser@gmail.com' + '-last-email'))!)

    const passwordResetToken = lastEmail!.html.match(/[?&]token=([^"&]+)/)?.[1]

    const responseResetPassword = await client.auth['reset-password'][':token'].$post({
      json: {
        newPassword: 'password456',
      },
      param: {
        token: passwordResetToken!,
      },
    })

    expect(responseResetPassword.status).toBe(204)
  })
})

describe('/change-password', () => {
  test('should change password', async () => {
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
          newPassword: 'password456',
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

  test('should not change password with invalid current password', async () => {
    const registerResponse = await client.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },

    })

    const cookie = parseCookie(registerResponse.headers.get('Set-Cookie')!, 'session_token')

    const responseChangePasswordIncorrect = await client.auth['change-password'].$patch(
      {
        json: {
          currentPassword: 'wrongpassword',
          newPassword: 'password456',
        },
      },
      {
        headers: {
          Cookie: `session_token=${cookie.session_token}`,
        },
      },
    )

    expect(responseChangePasswordIncorrect.status as unknown).toBe(401)
    expect(await responseChangePasswordIncorrect.json()).toMatchObject({
      error: {
        code: 'INVALID_CURRENT_PASSWORD',
      },
    })
  })
})
