import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { HomeIcon } from 'lucide-react'

import { getCommunitiesJoinedOptions } from '@/api/@tanstack/react-query.gen'
import { Button } from '@/components/ui/button'

import { CommunityList, CommunityListLoading } from './-components/community-list'

export const Route = createFileRoute('/(chat)/_layout')({
  component: Layout,
  pendingComponent: LayoutLoading,
  beforeLoad: ({ context }) => {
    if (!context.user)
      throw redirect({ to: '/login' })
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(getCommunitiesJoinedOptions()),
})

function Layout() {
  return (
    <div className="flex h-screen w-screen bg-zinc-100 p-4 pl-0">
      <div className="flex-col h-full w-20 flex items-center gap-4">
        <Link to="/">
          <Button
            size="icon-lg"
            variant="outline"
          >
            <HomeIcon />
          </Button>
        </Link>

        <div className="w-8 h-px bg-border" />

        <CommunityList />
      </div>

      <div className="border border-border size-full rounded-xl">
        <Outlet />
      </div>
    </div>
  )
}

function LayoutLoading() {
  return (
    <div className="flex h-screen w-screen bg-zinc-100 p-4 pl-0">
      <div className="flex-col h-full w-20 flex items-center gap-4">
        <Link to="/">
          <Button
            disabled
            size="icon-lg"
            variant="outline"
          >
            <HomeIcon />
          </Button>
        </Link>

        <div className="w-8 h-px bg-border" />

        <CommunityListLoading />
      </div>

      <div className="border border-border size-full rounded-xl">
        <Outlet />
      </div>
    </div>
  )
}
