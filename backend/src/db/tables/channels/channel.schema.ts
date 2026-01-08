import z from 'zod'

import { IdSchema } from '@/shared/zod'

export const ChannelSchema = z.object({
  id: IdSchema,
  communityId: IdSchema,
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.iso.datetime(),
})
