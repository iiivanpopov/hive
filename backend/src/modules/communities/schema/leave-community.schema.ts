import z from 'zod'

import { CommunitySchema } from '@/db/tables/communities'
import { IdSchema } from '@/shared/zod'

export const LeaveCommunityParamsSchema = z.object({
  communityId: IdSchema,
})

export type LeaveCommunityParam = z.infer<typeof LeaveCommunityParamsSchema>

export const LeaveCommunityResponseSchema = z.object({
  community: CommunitySchema,
})

export type LeaveCommunityResponse = z.infer<typeof LeaveCommunityResponseSchema>
