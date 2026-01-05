import { createFileRoute, Outlet } from '@tanstack/react-router'

import { getCommunitiesIdOptions } from '@/api/@tanstack/react-query.gen'
import { Separator } from '@/components/ui/separator'
import { queryClient } from '@/providers/query-provider'

import { ChannelList } from './-components/channel-list'
import { CommunitySidebarHeader } from './-components/community-sidebar-header'

export const Route = createFileRoute('/(root)/_communities/$communitySlug/_community')({
  component: RouteComponent,
  loader: async ({ params }) => queryClient.ensureQueryData(getCommunitiesIdOptions({
    path: {
      id: params.communitySlug,
    },
  })),
})

function RouteComponent() {
  return (
    <div className="flex flex-1">
      <div className="w-48 bg-zinc-100 py-4">
        <div className="relative py-2 border-l-[1.5px] border-b-[1.5px] border-t-[1.5px] rounded-tl-md rounded-bl-md h-full border-border flex flex-col gap-2">
          <CommunitySidebarHeader />

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
