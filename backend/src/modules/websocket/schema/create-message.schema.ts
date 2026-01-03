import z from 'zod'

import { validationConfig } from '@/config'
import { IdSchema } from '@/shared/zod'

export const CreateMessageSchema = z.object({
  channelId: IdSchema,
  content: z.string()
    .min(validationConfig.minMessageContent)
    .max(validationConfig.maxMessageContent),
})
