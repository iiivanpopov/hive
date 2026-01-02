import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import { migrateDatabase, resetDatabase } from '@/db/utils'
import { cacheMock } from '@/tests/mocks/cache.mock'
import { clientMock } from '@/tests/mocks/client.mock'
import { databaseMock } from '@/tests/mocks/database.mock'
import { sendMailMock } from '@/tests/mocks/mail-service.mock'
import { extractSessionTokenCookie, extractTokenFromMail } from '@/tests/utils'

beforeAll(() => {
  migrateDatabase(databaseMock)
})

afterEach(() => {
  resetDatabase(databaseMock)
  cacheMock.reset()
})

describe('/register', () => {
  it('should register a new user', async () => {
    const payload = {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    }

    await clientMock.auth.register.$post({ json: payload })

    expect(sendMailMock).toHaveBeenCalledTimes(1)

    const mail = sendMailMock.mock.calls[0][0]

    expect(mail).toMatchObject({
      to: payload.email,
      subject: expect.any(String),
      from: expect.any(String),
    })

    const token = extractTokenFromMail(mail)

    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )

    const user = await databaseMock.query.users.findFirst({
      where: { email: payload.email },
    })

    expect(user).toBeDefined()
    expect(user!.email).toBe(payload.email)
    expect(user!.username).toBe(payload.username)
    expect(user!.passwordHash).not.toBe(payload.password)
  })

  it('should not register an existing user', async () => {
    const payload = {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    }

    await clientMock.auth.register.$post({ json: payload })

    const response = await clientMock.auth.register.$post({ json: payload })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body).toMatchObject({
      error: { code: 'USER_EXISTS' },
    })

    const users = await databaseMock.query.users.findMany({
      where: { email: payload.email },
    })

    expect(users).toHaveLength(1)
    expect(response.headers.get('Set-Cookie')).toBeNull()
    expect(sendMailMock).toHaveBeenCalledTimes(1)
  })
})

describe('/confirm-email', () => {
  it('confirms email with valid token', async () => {
    const payload = {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    }

    await clientMock.auth.register.$post({ json: payload })

    expect(sendMailMock).toHaveBeenCalledTimes(1)

    const mail = sendMailMock.mock.calls[0][0]
    const token = extractTokenFromMail(mail)!

    const response = await clientMock.auth['confirm-email'][':token'].$post({
      param: { token },
    })

    expect(response.status).toBe(204)
  })

  it('should resend confirmation email', async () => {
    const payload = {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    }

    await clientMock.auth.register.$post({ json: payload })
    expect(sendMailMock).toHaveBeenCalledTimes(1)

    const response = await clientMock.auth['confirm-email'].resend.$post({
      json: { email: payload.email },
    })

    expect(response.status).toBe(204)
    expect(sendMailMock).toHaveBeenCalledTimes(2)

    const mail = sendMailMock.mock.calls.at(-1)![0]
    const token = extractTokenFromMail(mail)

    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
  })

  it('rate limits resend confirmation email', async () => {
    const payload = {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: 'password123',
    }

    await clientMock.auth.register.$post({ json: payload })

    for (let i = 0; i < 5; i++) {
      await clientMock.auth['confirm-email'].resend.$post({
        json: { email: payload.email },
      })
    }

    const response = await clientMock.auth['confirm-email'].resend.$post({
      json: { email: payload.email },
    })

    expect(response.status).toBe(429)
  })
})

describe('/login', () => {
  it('rejects invalid credentials', async () => {
    const response = await clientMock.auth.login.$post({
      json: {
        identity: 'testuser',
        password: 'wrongpassword',
      },
    })

    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toMatchObject({
      error: { code: 'INVALID_CREDENTIALS' },
    })
  })

  it('logs in a user', async () => {
    await clientMock.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    const response = await clientMock.auth.login.$post({
      json: {
        identity: 'testuser',
        password: 'password123',
      },
    })

    expect(response.status).toBe(204)
    expect(response.headers.get('Set-Cookie')).toBeTruthy()
  })
})

describe('/logout', () => {
  it('logs out a user', async () => {
    const response = await clientMock.auth.logout.$post()

    expect(response.status).toBe(204)
    expect(response.headers.get('Set-Cookie')).toBeTruthy()
  })
})

describe('/request-reset', () => {
  it('sends password reset email for existing user', async () => {
    await clientMock.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    const response = await clientMock.auth['request-reset'].$post({
      json: { email: 'testuser@gmail.com' },
    })

    expect(response.status).toBe(204)
    expect(sendMailMock).toHaveBeenCalled()

    const mail = sendMailMock.mock.calls.at(-1)![0]
    const token = extractTokenFromMail(mail)

    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
  })

  it('returns 204 for non-existent email', async () => {
    const response = await clientMock.auth['request-reset'].$post({
      json: { email: 'testuser@gmail.com' },
    })

    expect(response.status).toBe(204)
    expect(sendMailMock).not.toHaveBeenCalled()
  })

  it('rate limits reset attempts for existing account', async () => {
    await clientMock.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    for (let i = 0; i < 5; i++) {
      await clientMock.auth['request-reset'].$post({
        json: { email: 'testuser@gmail.com' },
      })
    }

    const response = await clientMock.auth['request-reset'].$post({
      json: { email: 'testuser@gmail.com' },
    })

    expect(response.status).toBe(429)
    expect(await response.json()).toMatchObject({
      error: { code: 'TOO_MANY_PASSWORD_RESET_ATTEMPTS' },
    })
  })

  it('does not rate limit non-existent account', async () => {
    for (let i = 0; i < 6; i++) {
      const response = await clientMock.auth['request-reset'].$post({
        json: { email: 'testuser@gmail.com' },
      })

      expect(response.status).toBe(204)
    }
  })
})

describe('/reset-password', () => {
  it('resets password with valid token', async () => {
    await clientMock.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    await clientMock.auth['request-reset'].$post({
      json: { email: 'testuser@gmail.com' },
    })

    const mail = sendMailMock.mock.calls.at(-1)![0]
    const token = extractTokenFromMail(mail)!

    const response = await clientMock.auth['reset-password'][':token'].$post({
      param: { token },
      json: { newPassword: 'password456' },
    })

    expect(response.status).toBe(204)
  })
})

describe('/change-password', () => {
  it('changes password with valid current password', async () => {
    const registerResponse = await clientMock.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    const cookie = extractSessionTokenCookie(registerResponse.headers)
    expect(cookie).toBeTruthy()

    const response = await clientMock.auth['change-password'].$patch(
      {
        json: {
          currentPassword: 'password123',
          newPassword: 'password456',
        },
      },
      {
        headers: { Cookie: cookie },
      },
    )

    expect(response.status).toBe(204)
  })

  it('rejects invalid current password', async () => {
    const registerResponse = await clientMock.auth.register.$post({
      json: {
        email: 'testuser@gmail.com',
        username: 'testuser',
        password: 'password123',
      },
    })

    const cookie = extractSessionTokenCookie(registerResponse.headers)
    expect(cookie).toBeTruthy()

    const response = await clientMock.auth['change-password'].$patch(
      {
        json: {
          currentPassword: 'wrongpassword',
          newPassword: 'password456',
        },
      },
      { headers: { Cookie: cookie } },
    )

    expect(response.status).toBe(401)
    expect(await response.json()).toMatchObject({
      error: { code: 'INVALID_CURRENT_PASSWORD' },
    })
  })
})
