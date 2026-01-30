import { createFileRoute } from '@tanstack/react-router'

import { getChannelsChannelIdOptions } from '@/api/@tanstack/react-query.gen'
import { queryClient } from '@/lib/query-client'

export const Route = createFileRoute('/(layout)/_layout/c/$communityId/_layout/$channelId/')({
  component: RouteComponent,
  head: ({ loaderData }) => ({
    meta: [{ title: `#${(loaderData as any)?.channel?.name}` }],
  }),
  loader: ({ params }) => queryClient.ensureQueryData(getChannelsChannelIdOptions({
    path: { channelId: +params.channelId },
  })),
})

function RouteComponent() {
  return <div>Hello "/(layout)/_layout/c/$communityId/$channelId/"!</div>
}
