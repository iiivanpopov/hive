import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { getChannelsChannelIdOptions } from '@/api/@tanstack/react-query.gen'
import { queryClient } from '@/lib/query-client'

const RouteParamsSchema = z.object({
  communityId: z.coerce.number().int().positive(),
  channelId: z.coerce.number().int().positive(),
})

export const Route = createFileRoute('/(layout)/_layout/c/$communityId/_layout/$channelId/')({
  component: RouteComponent,
  params: RouteParamsSchema,
  loader: ({ params: { channelId } }) => queryClient.ensureQueryData(getChannelsChannelIdOptions({
    path: { channelId },
  })),
  head: ({ loaderData }) => ({ meta: [{ title: `#${loaderData?.channel?.name}` }] }),
})

function RouteComponent() {
  return <div>Hello "/(layout)/_layout/c/$communityId/$channelId/"!</div>
}
