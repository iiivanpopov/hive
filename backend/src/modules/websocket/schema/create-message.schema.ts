import z from 'zod'

import { validationConfig } from '@/config'

export const CreateMessageSchema = z.object({
  clientId: z.string().uuid().optional(),
  content: z.string()
    .min(validationConfig.minMessageContent)
    .max(validationConfig.maxMessageContent),
})
