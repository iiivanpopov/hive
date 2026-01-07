import z from 'zod'

import { ChannelSchema } from '@/db/tables/channels'
import { IdSchema } from '@/shared/zod'

export const DeleteChannelParamsSchema = z.object({
  channelId: IdSchema,
})

export type DeleteChannelParams = z.infer<typeof DeleteChannelParamsSchema>

export const DeletedChannelResponseSchema = z.object({
  channel: ChannelSchema,
})

export type DeletedChannelResponse = z.infer<typeof DeletedChannelResponseSchema>
