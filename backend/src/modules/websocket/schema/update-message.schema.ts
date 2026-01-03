import z from 'zod'

import { validationConfig } from '@/config'
import { IdSchema } from '@/shared/zod'

export const UpdateMessageSchema = z.object({
  messageId: IdSchema,
  content: z.string()
    .min(validationConfig.minMessageContent)
    .max(validationConfig.maxMessageContent),
})
