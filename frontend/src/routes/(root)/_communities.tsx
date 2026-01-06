import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router'
import { HomeIcon } from 'lucide-react'

import { getCommunitiesJoinedOptions } from '@/api/@tanstack/react-query.gen'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { queryClient } from '@/providers/query-provider'

import { CommunityList } from './-components/community-list'
import { CommunityListSkeleton } from './-components/community-list-skeleton'

export const Route = createFileRoute('/(root)/_communities')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (!context.user)
      throw redirect({ to: '/login' })
  },
  loader: async () => queryClient.ensureQueryData(getCommunitiesJoinedOptions()),
  pendingComponent: LoadingComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  const handleGoHome = () => navigate({ to: '/' })

  return (
    <div className="flex min-h-screen min-w-screen">
      <div className="bg-zinc-100 dark:bg-zinc-900">
        <div className="relative flex-col h-[90vh] py-4 w-20 flex items-center gap-4">
          <Button
            size="icon-lg"
            variant="outline"
            onClick={handleGoHome}
          >
            <HomeIcon />
          </Button>

          <Separator className="w-10!" />

          <CommunityList />
        </div>
      </div>

      <Outlet />
    </div>
  )
}

function LoadingComponent() {
  return (
    <div className="flex min-h-screen min-w-screen">
      <div className="bg-zinc-100 dark:bg-zinc-900">
        <div className="relative flex-col h-[90vh] py-4 w-20 flex items-center gap-4">
          <div className="size-10 rounded-md bg-zinc-200/50 animate-pulse" />

          <Separator className="w-10!" />

          <CommunityListSkeleton />
        </div>
      </div>

      <Outlet />
    </div>
  )
}
