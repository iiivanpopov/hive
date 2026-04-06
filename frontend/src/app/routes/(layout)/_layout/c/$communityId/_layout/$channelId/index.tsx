import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

import type { GetChannelsChannelIdMessagesResponse, GetChannelsChannelIdResponse } from '@/api/types.gen'

import { getChannelsChannelId, getChannelsChannelIdMessages } from '@/api/sdk.gen'

import { ChannelChat } from '../../-components'

const RouteParamsSchema = z.object({
  communityId: z.coerce.number().int().positive(),
  channelId: z.coerce.number().int().positive(),
})

export const Route = createFileRoute('/(layout)/_layout/c/$communityId/_layout/$channelId/')({
  component: ChannelChat,
  params: RouteParamsSchema,
  loader: async ({ params: { channelId } }) => {
    const [{ channel }, initialPage] = await Promise.all([
      getChannelsChannelId({
        path: { channelId },
        responseStyle: 'data',
        throwOnError: true,
      }) as unknown as Promise<GetChannelsChannelIdResponse>,
      getChannelsChannelIdMessages({
        path: { channelId },
        query: { limit: 50 },
        responseStyle: 'data',
        throwOnError: true,
      }) as unknown as Promise<GetChannelsChannelIdMessagesResponse>,
    ])

    return {
      channel,
      initialPage,
    }
  },
  head: ({ loaderData }) => ({ meta: [{ title: `#${loaderData?.channel?.name}` }] }),
})
