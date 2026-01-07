import z from 'zod'

import { validationConfig } from '@/config'
import { CommunitySchema } from '@/db/tables/communities'
import { IdSchema } from '@/shared/zod'

export const UpdateCommunityBodySchema = z.object({
  name: z.string()
    .min(validationConfig.minCommunityName)
    .max(validationConfig.maxCommunityName)
    .optional(),
})

export type UpdateCommunityBody = z.infer<typeof UpdateCommunityBodySchema>

export const UpdateCommunityParamsSchema = z.object({
  communityId: IdSchema,
})

export type UpdateCommunityParam = z.infer<typeof UpdateCommunityParamsSchema>

export const UpdateCommunityResponseSchema = z.object({
  community: CommunitySchema,
})

export type UpdateCommunityResponse = z.infer<typeof UpdateCommunityResponseSchema>
