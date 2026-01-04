import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

import type { GetAuthMeResponse } from '@/api/types.gen'

import { getAuthMeOptions } from '@/api/@tanstack/react-query.gen'
import { queryClient } from '@/providers/query-provider'

interface RootRouteContext {
  user: GetAuthMeResponse['user'] | null
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: Outlet,
  beforeLoad: async () => {
    try {
      const query = await queryClient.ensureQueryData(getAuthMeOptions({
        meta: {
          toast: false,
        },
      }))

      if (query.user)
        return query

      return { user: null }
    }
    catch {
      return { user: null }
    }
  },
})
