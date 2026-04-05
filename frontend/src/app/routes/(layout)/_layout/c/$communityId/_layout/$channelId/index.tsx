import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import { getChannelsChannelIdMessagesOptions, getChannelsChannelIdOptions } from '@/api/@tanstack/react-query.gen'
import { queryClient } from '@/lib/query-client'

import { ChannelChat } from '../../-components'

const RouteParamsSchema = z.object({
  communityId: z.coerce.number().int().positive(),
  channelId: z.coerce.number().int().positive(),
})

export const Route = createFileRoute('/(layout)/_layout/c/$communityId/_layout/$channelId/')({
  component: ChannelChat,
  params: RouteParamsSchema,
  loader: async ({ params: { channelId } }) => {
    const [channelResponse, messagesResponse] = await Promise.all([
      queryClient.ensureQueryData(getChannelsChannelIdOptions({
        path: { channelId },
      })),
      queryClient.ensureQueryData(getChannelsChannelIdMessagesOptions({
        path: { channelId },
        query: { limit: 50 },
      })),
    ])

    return {
      channel: channelResponse.channel,
      initialMessages: messagesResponse.messages,
    }
  },
  head: ({ loaderData }) => ({ meta: [{ title: `#${loaderData?.channel?.name}` }] }),
})
