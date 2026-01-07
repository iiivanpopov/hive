import z from 'zod'

import { MessageSchema } from '@/db/tables/messages'
import { IdSchema } from '@/shared/zod'

export const DeleteMessageParamsSchema = z.object({
  messageId: IdSchema,
})

export type DeleteMessageParams = z.infer<typeof DeleteMessageParamsSchema>

export const DeleteMessageResponseSchema = z.object({
  message: MessageSchema,
})
