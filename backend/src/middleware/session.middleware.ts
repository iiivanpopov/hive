import { eq } from 'drizzle-orm'
import { deleteCookie, getCookie } from 'hono/cookie'
import { authConfig } from '@/config/auth.config'
import { db } from '@/db/instance'
import { sessions } from '@/db/schema'
import { ApiException } from '@/lib/api-exception'
import { factory } from '@/lib/factory'
import { normalizeUserAgent } from '@/lib/utils'

export function sessionMiddleware() {
  return factory.createMiddleware(async (c, next) => {
    const sessionToken = getCookie(c, authConfig.sessionTokenName)
    if (!sessionToken)
      throw ApiException.Unauthorized('No authorization token provided', 'NO_TOKEN')

    const [session] = await db.query.sessions.findMany({
      where: { token: sessionToken },
      with: {
        user: true,
      },
    })
    if (!session) {
      deleteCookie(c, authConfig.sessionTokenName)
      throw ApiException.Unauthorized('Invalid authorization token', 'INVALID_TOKEN')
    }

    if (session.lastActivityAt.getTime() + authConfig.sessionTokenTTL * 1000 < Date.now()) {
      deleteCookie(c, authConfig.sessionTokenName)
      await db
        .delete(sessions)
        .where(eq(sessions.id, session.id))
      throw ApiException.Unauthorized('Session has expired', 'SESSION_EXPIRED')
    }

    if (normalizeUserAgent(c.req.header('User-Agent')) !== session.userAgent) {
      deleteCookie(c, authConfig.sessionTokenName)
      throw ApiException.Unauthorized('User-Agent does not match', 'USER_AGENT_MISMATCH')
    }

    await db
      .update(sessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(sessions.id, session.id))

    c.set('user', session.user!)

    await next()
  })
}
