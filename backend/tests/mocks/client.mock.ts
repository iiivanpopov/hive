import { testClient } from 'hono/testing'

import { createApp } from '@/app/create-app'
import { ConfirmationTokenRepository } from '@/repositories/confirmation-token.repository'
import { ResetPasswordTokenRepository } from '@/repositories/reset-password.token.repository'
import { SessionTokenRepository } from '@/repositories/session-token.repository'

import { cacheMock } from './cache.mock'
import { databaseMock } from './database.mock'
import { mailServiceMock } from './mail-service.mock'

const confirmationTokensRepositoryMock = new ConfirmationTokenRepository(cacheMock)
const resetPasswordTokensRepositoryMock = new ResetPasswordTokenRepository(cacheMock)
const sessionTokensRepositoryMock = new SessionTokenRepository(cacheMock)

export const clientMock = testClient(createApp(
  databaseMock,
  mailServiceMock,
  confirmationTokensRepositoryMock,
  resetPasswordTokensRepositoryMock,
  sessionTokensRepositoryMock,
), undefined, undefined, { init: { credentials: 'include' } })
