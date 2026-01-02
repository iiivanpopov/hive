import z from 'zod'

import { MessageSchema } from '@/db/tables/messages'
import { IdSchema } from '@/shared/zod'

export const UpdateMessageParamsSchema = z.object({
  id: IdSchema,
})

export const UpdateMessageBodySchema = z.object({
  content: z.string().min(1).max(2000),
})

export type UpdateMessageBody = z.infer<typeof UpdateMessageBodySchema>

export const UpdateMessageResponseSchema = z.object({
  message: MessageSchema,
})
