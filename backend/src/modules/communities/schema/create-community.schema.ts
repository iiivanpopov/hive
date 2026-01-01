import z from 'zod'

import { validationConfig } from '@/config'
import { CommunitySchema } from '@/db/schema'

export const CreateCommunityBodySchema = z.object({
  name: z.string()
    .min(validationConfig.minCommunityName)
    .max(validationConfig.maxCommunityName),
})

export type CreateCommunityBody = z.infer<typeof CreateCommunityBodySchema>

export const CreateCommunityResponseSchema = z.object({
  community: CommunitySchema,
})

export type CreateCommunityResponse = z.infer<typeof CreateCommunityResponseSchema>
