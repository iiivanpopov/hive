import z from 'zod'

import { IdSchema } from '@/shared/zod'

export const DeleteCommunityParamsSchema = z.object({
  id: IdSchema,
})

export type DeleteCommunityParam = z.infer<typeof DeleteCommunityParamsSchema>
