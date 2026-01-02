import z from 'zod'

import { IdSchema } from '@/shared/zod'

import { channelTypes } from './channels.table'

export const ChannelSchema = z.object({
  id: IdSchema,
  communityId: IdSchema,
  type: z.enum(channelTypes),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.iso.datetime(),
})
