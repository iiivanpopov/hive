import z from 'zod'

import { MessageSchema } from '@/db/tables/messages'

export const GetChannelMessagesParamsSchema = z.object({
  id: z.string(),
})

export const GetChannelMessagesResponseSchema = z.object({
  messages: z.array(MessageSchema),
})
