import { createRootRouteWithContext, HeadContent, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

import type { GetAuthMeResponse } from '@/api/types.gen.ts'

import { getAuthMeOptions } from '@/api/@tanstack/react-query.gen.ts'
import { queryClient } from '@/lib/query-client.ts'

interface RootRouteContext {
  user: GetAuthMeResponse['user'] | null
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: Root,
  pendingComponent: RootLoading,
  head: () => ({
    meta: [{ title: 'Hive' }],
  }),
  beforeLoad: async () => {
    const query = await queryClient.ensureQueryData(getAuthMeOptions({
      meta: {
        toast: false,
      },
    })).catch(() => null)

    return query?.user ? query : { user: null }
  },
})

function Root() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  )
}

function RootLoading() {
  return (
    <>
      <HeadContent />
      <div className="flex h-screen justify-center items-center">
        <Loader className="animate-spin" />
      </div>
    </>
  )
}
