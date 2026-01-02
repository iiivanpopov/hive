import type { ClientResponse } from 'hono/client'

import { parse as parseCookie } from 'hono/utils/cookie'
import { expect } from 'vitest'

import { authConfig } from '@/config'

export function extractHtml(mail: { html?: unknown }): string {
  if (typeof mail.html === 'string')
    return mail.html

  if (
    mail.html
    && typeof mail.html === 'object'
    && 'html' in mail.html
    && typeof (mail.html as any).html === 'string'
  ) {
    return (mail.html as any).html
  }

  throw new Error('Mail html is not a string')
}

export function extractTokenFromMail(mail: { html?: unknown }): string {
  const html = extractHtml(mail)
  const match = html.match(/[?&]token=([^"&]+)/)

  expect(match).not.toBeNull()
  return match![1]
}

export function getSessionTokenCookie(response: ClientResponse<any>): string | null {
  const setCookieHeader = response.headers.get('Set-Cookie')
  const sessionTokenCookie = parseCookie(setCookieHeader!, 'session_token')
  return `${authConfig.sessionTokenCookie}=${sessionTokenCookie.session_token}`
}
