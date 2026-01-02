import type { ClientResponse } from 'hono/client'

import { parse as parseCookie } from 'hono/utils/cookie'

import { authConfig } from '@/config'

export function getSessionTokenCookie(response: ClientResponse<any>): string | null {
  const setCookieHeader = response.headers.get('Set-Cookie')
  if (!setCookieHeader)
    return null

  const sessionTokenCookie = parseCookie(setCookieHeader, 'session_token')
  return `${authConfig.sessionTokenCookie}=${sessionTokenCookie.session_token}` || null
}
