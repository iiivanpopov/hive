import z from 'zod'

import { IdSchema } from '@/shared/zod'

export const LeaveCommunityParamSchema = z.object({
  id: IdSchema,
})

export type LeaveCommunityParam = z.infer<typeof LeaveCommunityParamSchema>
