import { createFileRoute, Outlet } from '@tanstack/react-router'

import { getCommunitiesIdOptions } from '@/api/@tanstack/react-query.gen'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { queryClient } from '@/providers/query-provider'

import { ChannelList } from './-components/channel-list'
import { ChannelListSkeleton } from './-components/channel-list-skeleton'
import { CommunityMenu } from './-components/community-menu'
import { CommunityMenuSkeleton } from './-components/community-menu-skeleton'

export const Route = createFileRoute('/(root)/_communities/$communitySlug/_community')({
  component: RouteComponent,
  loader: async ({ params }) => queryClient.ensureQueryData(getCommunitiesIdOptions({
    path: {
      id: params.communitySlug,
    },
  })),
  errorComponent: ErrorComponent,
  pendingComponent: LoadingComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-1">
      <div className="w-48 bg-zinc-100 py-4">
        <div className="relative py-2 border-l border-b border-t rounded-tl-md rounded-bl-md h-full border-border flex flex-col gap-2">
          <CommunityMenu />

          <Separator />

          <ChannelList />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>

      <div className="w-48 bg-zinc-100 py-6 px-2">
        MEMBERS
      </div>
    </div>
  )
}

function LoadingComponent() {
  return (
    <div className="flex flex-1">
      <div className="w-48 bg-zinc-100 py-4">
        <div className="relative py-2 border-l border-b border-t rounded-tl-md rounded-bl-md h-full border-border flex flex-col gap-2">
          <CommunityMenuSkeleton />

          <Separator />

          <ChannelListSkeleton />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>

      <div className="w-48 bg-zinc-100 py-6 px-2">
        MEMBERS
      </div>
    </div>
  )
}

function ErrorComponent({ error }: { error: Error }) {
  const { code, message } = (error as any).error || {
    code: error.name,
    message: error.message,
  }

  return (
    <div className="w-full flex justify-center items-center flex-col gap-4">
      <Typography variant="heading">
        {code}
      </Typography>
      <Typography variant="subheading">
        {message}
      </Typography>
    </div>
  )
}
