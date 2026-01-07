import z from 'zod'

import { validationConfig } from '@/config'
import { MessageSchema } from '@/db/tables/messages'
import { IdSchema } from '@/shared/zod'

export const CreateMessageBodySchema = z.object({
  content: z.string()
    .min(validationConfig.minMessageContent)
    .max(validationConfig.maxMessageContent),
})

export type CreateMessageBody = z.infer<typeof CreateMessageBodySchema>

export const CreateMessageParamsSchema = z.object({
  channelId: IdSchema,
})

export type CreateMessageParams = z.infer<typeof CreateMessageParamsSchema>

export const CreateMessageResponseSchema = z.object({
  message: MessageSchema,
})
