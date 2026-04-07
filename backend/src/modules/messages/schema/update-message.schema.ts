import z from 'zod'

import { validationConfig } from '@/config'
import { MessageSchema } from '@/db/tables/messages'
import { IdSchema } from '@/shared/zod'

export const UpdateMessageParamsSchema = z.object({
  messageId: IdSchema,
})

export type UpdateMessageParams = z.infer<typeof UpdateMessageParamsSchema>

export const UpdateMessageBodySchema = z.object({
  content: z.string()
    .min(validationConfig.minMessageContent)
    .max(validationConfig.maxMessageContent),
})

export type UpdateMessageBody = z.infer<typeof UpdateMessageBodySchema>

export const UpdateMessageResponseSchema = z.object({
  message: MessageSchema,
})
