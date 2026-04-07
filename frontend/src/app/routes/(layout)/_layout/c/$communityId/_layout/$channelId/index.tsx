import { createFileRoute, redirect } from '@tanstack/react-router'
import z from 'zod'

import type { GetChannelsChannelIdMessagesResponse, GetChannelsChannelIdResponse } from '@/api/types.gen'

import { getChannelsChannelId, getChannelsChannelIdMessages } from '@/api/sdk.gen'

import { ChannelChat } from './-components'

const RouteParamsSchema = z.object({
  communityId: z.coerce.number().int().positive(),
  channelId: z.coerce.number().int().positive(),
})

export const Route = createFileRoute('/(layout)/_layout/c/$communityId/_layout/$channelId/')({
  component: ChannelChat,
  params: RouteParamsSchema,
  loader: async ({ params: { communityId, channelId } }) => {
    try {
      const [{ channel }, initialPage] = await Promise.all([
        getChannelsChannelId({
          path: { channelId },
          responseStyle: 'data',
          throwOnError: true,
          meta: { toast: false },
        }) as unknown as Promise<GetChannelsChannelIdResponse>,
        getChannelsChannelIdMessages({
          path: { channelId },
          query: { limit: 50 },
          responseStyle: 'data',
          throwOnError: true,
          meta: { toast: false },
        }) as unknown as Promise<GetChannelsChannelIdMessagesResponse>,
      ])

      return {
        channel,
        initialPage,
      }
    }
    catch (error) {
      if (isMissingChannelError(error)) {
        throw redirect({
          to: '/c/$communityId',
          params: { communityId },
        })
      }

      throw error
    }
  },
  head: ({ loaderData }) => ({ meta: [{ title: `#${loaderData?.channel?.name}` }] }),
})

function isMissingChannelError(error: unknown) {
  if (typeof error !== 'object' || error === null || !('error' in error))
    return false

  if (typeof error.error !== 'object' || error.error === null || !('code' in error.error))
    return false

  const code = error.error.code

  return code === 'CHANNEL_NOT_FOUND' || code === 'NOT_A_MEMBER'
}
