import type { CommunityMemberRole } from '@/db/tables/community-members'

import { ApiException } from '@/lib/api-exception'
import { factory } from '@/lib/factory'

export function role(roles: CommunityMemberRole[] | 'all') {
  return factory.createMiddleware(async (c, next) => {
    const membership = c.get('membership')

    if (!roles.includes(membership.role) && roles !== 'all')
      throw ApiException.Forbidden('You are not allowed to access this resource', 'FORBIDDEN')

    await next()
  })
}
