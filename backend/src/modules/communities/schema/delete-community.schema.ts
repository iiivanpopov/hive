import z from 'zod'

import { CommunitySchema } from '@/db/tables/communities'
import { IdSchema } from '@/shared/zod'

export const DeleteCommunityParamsSchema = z.object({
  communityId: IdSchema,
})

export type DeleteCommunityParam = z.infer<typeof DeleteCommunityParamsSchema>

export const DeleteCommunityResponseSchema = z.object({
  community: CommunitySchema,
})
