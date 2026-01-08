import z from 'zod'

import { validationConfig } from '@/config'

export const CreateMessageSchema = z.object({
  content: z.string()
    .min(validationConfig.minMessageContent)
    .max(validationConfig.maxMessageContent),
})
