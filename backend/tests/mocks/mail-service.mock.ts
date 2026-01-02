import { mock } from 'bun:test'

import type { MailOptions } from '@/lib/mail'

import { MailService } from '@/lib/mail'

export const sendMailMock = mock(async (_mailOptions: MailOptions) => {})

export const mailServiceMock = new MailService({
  sendMail: sendMailMock,
})
