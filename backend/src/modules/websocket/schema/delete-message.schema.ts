import z from 'zod'

import { IdSchema } from '@/shared/zod'

export const DeleteMessageSchema = z.object({
  messageId: IdSchema,
})
