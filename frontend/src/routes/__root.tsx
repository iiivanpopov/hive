import { createRootRouteWithContext, HeadContent, Outlet } from '@tanstack/react-router'

import type { GetAuthMeResponse } from '@/api/types.gen'

import { getAuthMeOptions } from '@/api/@tanstack/react-query.gen'

import { queryClient } from './-contexts/query'

interface RootRouteContext {
  user: GetAuthMeResponse['user'] | null
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
