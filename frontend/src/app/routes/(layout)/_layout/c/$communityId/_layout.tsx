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
      <div className="flex gap-4 h-full">
        <div className="w-48 border-border h-full border-r">
          <CommunityHeader />

          <Separator />

          <ChannelsList />
        </div>
        <Outlet />
      </div>
    </CreateInvitationProvider>
  )
}
