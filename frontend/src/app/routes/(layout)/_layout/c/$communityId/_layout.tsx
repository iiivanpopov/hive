import { createFileRoute, Outlet } from '@tanstack/react-router'

import { getCommunitiesCommunityIdChannelsOptions, getCommunitiesCommunityIdOptions } from '@/api/@tanstack/react-query.gen'
import { Separator } from '@/components/ui/separator'
import { queryClient } from '@/lib/query-client'

import { ChannelsList, CommunityHeader } from './-components'
import { CreateInvitationProvider } from './-providers/create-invitation-provider'

export const Route = createFileRoute('/(layout)/_layout/c/$communityId/_layout')({
  component: Layout,
  loader: async ({ params }) => {
    const communityId = +params.communityId

    const [community] = await Promise.all([
      queryClient.ensureQueryData(getCommunitiesCommunityIdOptions({
        path: { communityId },
      })),
      queryClient.ensureQueryData(getCommunitiesCommunityIdChannelsOptions({
        path: { communityId },
      })),
    ])

    return { communityId, community }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `#${loaderData?.community?.community?.name}` }],
  }),
})

function Layout() {
  return (
    <CreateInvitationProvider>
      <div className="flex h-full gap-4">
        <div className="h-full w-48 shrink-0 border-r border-border">
          <CommunityHeader />

          <Separator />

          <ChannelsList />
        </div>
        <Outlet />
      </div>
    </CreateInvitationProvider>
  )
}
