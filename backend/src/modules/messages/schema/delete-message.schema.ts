import z from 'zod'

import { IdSchema } from '@/shared/zod'

export const DeleteMessageParamsSchema = z.object({
  id: IdSchema,
})
