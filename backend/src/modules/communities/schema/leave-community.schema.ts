import z from 'zod'

import { IdSchema } from '@/shared/zod'

export const LeaveCommunityParamsSchema = z.object({
  id: IdSchema,
})

export type LeaveCommunityParam = z.infer<typeof LeaveCommunityParamsSchema>
