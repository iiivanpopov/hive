import type { DrizzleDatabase } from '@/db/instance'
import type { SessionTokenRepository } from '@/repositories/session-token.repository'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { authConfig } from '@/config/auth.config'
import { ApiException } from '@/lib/api-exception'
import { factory } from '@/lib/factory'
import { normalizeUserAgent } from '@/lib/utils'

export function sessionMiddleware(db: DrizzleDatabase, sessionTokens: SessionTokenRepository) {
  return factory.createMiddleware(async (c, next) => {
    const sessionToken = getCookie(c, authConfig.sessionTokenCookie)
    if (!sessionToken)
      throw ApiException.Unauthorized('No authorization token provided', 'NO_SESSION_TOKEN')

    const session = await sessionTokens.resolve(sessionToken)
    if (!session) {
      deleteCookie(c, authConfig.sessionTokenCookie)
      throw ApiException.Unauthorized('Invalid authorization token', 'INVALID_SESSION_TOKEN')
    }

    if (normalizeUserAgent(c.req.header('User-Agent')) !== session.userAgent) {
      deleteCookie(c, authConfig.sessionTokenCookie)
      throw ApiException.Unauthorized('User-Agent does not match', 'USER_AGENT_MISMATCH')
    }

    const user = await db.query.users.findFirst({
      where: { id: session.userId },
    })
    if (!user) {
      deleteCookie(c, authConfig.sessionTokenCookie)
      throw ApiException.Unauthorized('User not found', 'USER_NOT_FOUND')
    }

    await sessionTokens.refresh(sessionToken)

    setCookie(c, authConfig.sessionTokenCookie, sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: authConfig.sessionTokenTtl,
    })

    c.set('user', user)

    await next()
  })
}
