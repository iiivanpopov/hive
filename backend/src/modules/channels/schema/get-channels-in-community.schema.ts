import z from 'zod'

import { ChannelSchema } from '@/db/tables/channels'
import { IdSchema } from '@/shared/zod'

export const GetChannelsInCommunityParamsSchema = z.object({
  communityId: IdSchema,
})

export type GetChannelsInCommunityParams = z.infer<typeof GetChannelsInCommunityParamsSchema>

export const GetChannelsInCommunityResponseSchema = z.object({
  channels: z.array(ChannelSchema),
})

export type GetChannelsInCommunityResponse = z.infer<typeof GetChannelsInCommunityResponseSchema>
