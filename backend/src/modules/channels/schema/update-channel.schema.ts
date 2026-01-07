import z from 'zod'

import { ChannelSchema } from '@/db/tables/channels'
import { IdSchema } from '@/shared/zod'

export const UpdateChannelParamsSchema = z.object({
  channelId: IdSchema,
})

export type UpdateChannelParams = z.infer<typeof UpdateChannelParamsSchema>

export const UpdateChannelBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
})

export type UpdateChannelBody = z.infer<typeof UpdateChannelBodySchema>

export const UpdatedChannelResponseSchema = z.object({
  channel: ChannelSchema,
})

export type UpdatedChannelResponse = z.infer<typeof UpdatedChannelResponseSchema>
