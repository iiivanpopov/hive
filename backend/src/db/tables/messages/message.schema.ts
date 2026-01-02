import z from 'zod'

import { IdSchema } from '@/shared/zod'

export const MessageSchema = z.object({
  id: IdSchema,
  channelId: IdSchema,
  userId: IdSchema,
  content: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})
