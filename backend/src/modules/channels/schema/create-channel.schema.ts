import z from 'zod'

import { validationConfig } from '@/config'
import { ChannelSchema, channelTypes } from '@/db/tables/channels'
import { IdSchema } from '@/shared/zod'

export const CreateChannelBodySchema = z.object({
  name: z.string().min(validationConfig.minChannelName).max(validationConfig.maxChannelName),
  description: z.string().max(validationConfig.maxChannelDescription).optional(),
  type: z.enum(channelTypes),
})

export type CreateChannelBody = z.infer<typeof CreateChannelBodySchema>

export const CreateChannelParamsSchema = z.object({
  id: IdSchema,
})

export const CreateChannelResponseSchema = z.object({
  channel: ChannelSchema,
})
