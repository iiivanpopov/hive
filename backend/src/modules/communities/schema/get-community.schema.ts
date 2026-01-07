import z from 'zod'

import { CommunitySchema } from '@/db/tables/communities'
import { IdSchema } from '@/shared/zod'

export const GetCommunityParamsSchema = z.object({
  communityId: IdSchema,
})

export type GetCommunityParams = z.infer<typeof GetCommunityParamsSchema>

export const GetCommunityResponseSchema = z.object({
  community: CommunitySchema,
})
