import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { HomeIcon } from 'lucide-react'

import { getCommunitiesJoinedOptions } from '@/api/@tanstack/react-query.gen.ts'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator.tsx'
import { queryClient } from '@/lib/query-client.ts'

import { AddCommunityDialog, CommunityList, CommunityListLoading, CurrentUser, CurrentUserLoading } from './-components'
import { AddCommunityDialogProvider } from './-providers/add-community-dialog-provider'

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
    <AddCommunityDialogProvider>
      <div className="relative flex h-screen w-screen p-4 pl-0">
        <div className="flex h-full w-20 flex-col items-center">
          <Link
            to="/"
            className={buttonVariants({ size: 'icon-lg', variant: 'secondary' })}
          >
            <HomeIcon />
          </Link>

          <Separator className="mt-4 w-8!" />

          <CommunityList />

          <div className="mt-4">
            <AddCommunityDialog />
          </div>
        </div>

        <div className="size-full rounded-xl border border-border">
          <Outlet />
        </div>

        <CurrentUser />
      </div>
    </AddCommunityDialogProvider>
  )
}

function LayoutLoading() {
  return (
    <div className="relative flex h-screen w-screen p-4 pl-0">
      <div className="flex h-full w-20 flex-col items-center gap-4">
        <Link
          to="/"
          className={buttonVariants({ size: 'icon-lg', variant: 'secondary' })}
        >
          <HomeIcon />
        </Link>

        <Separator className="w-8!" />

        <CommunityListLoading />
      </div>

      <div className="size-full rounded-xl border border-border">
        <Outlet />
      </div>

      <CurrentUserLoading />
    </div>
  )
}
