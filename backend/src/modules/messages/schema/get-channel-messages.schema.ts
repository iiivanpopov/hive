import z from 'zod'

import { MessageSchema } from '@/db/tables/messages'
import { IdSchema } from '@/shared/zod'

export const GetChannelMessagesParamsSchema = z.object({
  id: IdSchema,
})

export const GetChannelMessagesResponseSchema = z.object({
  messages: z.array(MessageSchema),
})
