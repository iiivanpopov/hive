import z from 'zod'

import { MessageSchema } from '@/db/tables/messages'
import { IdSchema } from '@/shared/zod'

export const CreateMessageBodySchema = z.object({
  channelId: IdSchema,
  content: z.string().min(1).max(2000),
})

export type CreateMessageBody = z.infer<typeof CreateMessageBodySchema>

export const CreateMessageResponseSchema = z.object({
  message: MessageSchema,
})
