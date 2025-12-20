import { eq } from 'drizzle-orm'
import { getCookie } from 'hono/cookie'
import { cookiesConfig } from '@/config/cookies.config'
import { db } from '@/db/instance'
import { sessions } from '@/db/schema'
import { ApiException } from '@/lib/api-exception'
import { factory } from '@/lib/factory'

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
    if (!session)
      throw ApiException.Unauthorized('Invalid authorization token', 'INVALID_TOKEN')

    await db.update(sessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(sessions.id, session.id))

    c.set('user', session.user!)

    await next()
  })
}
