import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { HomeIcon } from 'lucide-react'

import { getCommunitiesJoinedOptions } from '@/api/@tanstack/react-query.gen.ts'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator.tsx'
import { queryClient } from '@/providers/query-provider'

import { AddCommunityDialog, CommunityList, CommunityListLoading, CurrentUser } from './-components'

export const Route = createFileRoute('/(layout)/_layout')({
  component: Layout,
  pendingComponent: LayoutLoading,
  beforeLoad: ({ context }) => {
    if (!context.user)
      throw redirect({ to: '/login' })
  },
  loader: () => queryClient.ensureQueryData(getCommunitiesJoinedOptions()),
})

function Layout() {
  return (
    <div className="flex h-screen w-screen p-4 pl-0 relative">
      <div className="flex-col h-full w-20 flex items-center gap-4">
        <Link
          to="/"
          className={buttonVariants({ size: 'icon-lg', variant: 'secondary' })}
        >
          <HomeIcon />
        </Link>

        <Separator className="w-8!" />

        <CommunityList />

        <Separator className="w-8!" />

        <AddCommunityDialog />
      </div>

      <div className="border border-border size-full rounded-xl">
        <Outlet />
      </div>

      <CurrentUser />
    </div>
  )
}

function LayoutLoading() {
  return (
    <div className="flex h-screen w-screen p-4 pl-0 relative">
      <div className="flex-col h-full w-20 flex items-center gap-4">
        <Link to="/">
          <Button
            size="icon-lg"
            variant="secondary"
          >
            <HomeIcon />
          </Button>
        </Link>

        <Separator className="w-8!" />

        <CommunityListLoading />
      </div>

      <div className="border border-border size-full rounded-xl">
        <Outlet />
      </div>
    </div>
  )
}
