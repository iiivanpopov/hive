import { eq } from 'drizzle-orm'
import { deleteCookie, getCookie } from 'hono/cookie'
import { cookiesConfig } from '@/config/cookies.config'
import { db } from '@/db/instance'
import { sessions } from '@/db/schema'
import { ApiException } from '@/lib/api-exception'
import { factory } from '@/lib/factory'

const SESSION_TIMEOUT_SECONDS = 7 * 24 * 60 * 60 // 7 days
// const SESSION_TIMEOUT_SECONDS = 10 // 7 days

function normalizeUserAgent(userAgent?: string | null) {
  return userAgent?.trim().toLowerCase() || 'unknown'
}

export function sessionMiddleware() {
  return factory.createMiddleware(async (c, next) => {
    const sessionToken = getCookie(c, cookiesConfig.sessionToken)
    if (!sessionToken)
      throw ApiException.Unauthorized('No authorization token provided', 'NO_TOKEN')

    const [session] = await db.query.sessions.findMany({
      where: { token: sessionToken },
      with: {
        user: true,
      },
    })
    if (!session) {
      deleteCookie(c, cookiesConfig.sessionToken)
      throw ApiException.Unauthorized('Invalid authorization token', 'INVALID_TOKEN')
    }

    if (session.lastActivityAt.getTime() / 1000 + SESSION_TIMEOUT_SECONDS < Date.now() / 1000) {
      deleteCookie(c, cookiesConfig.sessionToken)
      throw ApiException.Unauthorized('Session has expired', 'SESSION_EXPIRED')
    }

    const requestUserAgent = normalizeUserAgent(c.req.header('User-Agent'))
    const sessionUserAgent = normalizeUserAgent(session.userAgent)

    if (
      requestUserAgent !== 'unknown'
      && sessionUserAgent !== 'unknown'
      && requestUserAgent !== sessionUserAgent
    ) {
      deleteCookie(c, cookiesConfig.sessionToken)
      throw ApiException.Unauthorized('User-Agent does not match', 'USER_AGENT_MISMATCH')
    }

    await db.update(sessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(sessions.id, session.id))

    c.set('user', session.user!)

    await next()
  })
}
