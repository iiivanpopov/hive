import z from 'zod'

import { ChannelSchema } from '@/db/tables/channels'
import { IdSchema } from '@/shared/zod'

export const GetChannelResponseSchema = z.object({
  channel: ChannelSchema,
})

export const GetChannelParamsSchema = z.object({
  channelId: IdSchema,
})

export type GetChannelParams = z.infer<typeof GetChannelParamsSchema>
