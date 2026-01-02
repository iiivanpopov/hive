import z from 'zod'

import { IdSchema } from '@/shared/zod'

export const DeleteChannelParamsSchema = z.object({
  id: IdSchema,
})
