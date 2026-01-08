import type { QueryClient } from '@tanstack/react-query'

import { createRootRouteWithContext, HeadContent, Outlet } from '@tanstack/react-router'

import type { GetAuthMeResponse } from '@/api/types.gen'

import { getAuthMeOptions } from '@/api/@tanstack/react-query.gen'

interface RootRouteContext {
  user: GetAuthMeResponse['user'] | null
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: () => (
    <>
      <HeadContent />
      <Outlet />
    </>
  ),
  head: () => ({
    meta: [{ title: 'Hive' }],
  }),
  beforeLoad: async ({ context }) => {
    try {
      const query = await context.queryClient.ensureQueryData(getAuthMeOptions({
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
