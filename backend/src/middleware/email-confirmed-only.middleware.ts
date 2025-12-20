import { ApiException } from '@/lib/api-exception'
import { factory } from '@/lib/factory'

export function emailConfirmedOnly() {
  return factory.createMiddleware(async (c, next) => {
    const user = c.get('user')

    if (!user || !user.emailConfirmed)
      throw ApiException.Unauthorized('Email not confirmed', 'EMAIL_NOT_CONFIRMED')

    await next()
  })
}
