import z from 'zod'

import { IdSchema } from '@/shared/zod'

export const DeleteCommunityParamSchema = z.object({
  id: IdSchema,
})

export type DeleteCommunityParam = z.infer<typeof DeleteCommunityParamSchema>
