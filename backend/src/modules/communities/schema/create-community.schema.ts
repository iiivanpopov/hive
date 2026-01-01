import z from 'zod'

import { validationConfig } from '@/config'

export const CreateCommunityBodySchema = z.object({
  name: z.string()
    .min(validationConfig.minCommunityName)
    .max(validationConfig.maxCommunityName),
})

export type CreateCommunityBody = z.infer<typeof CreateCommunityBodySchema>

export const CreateCommunityResponseSchema = z.object({
  joinId: z.string().length(16),
})

export type CreateCommunityResponse = z.infer<typeof CreateCommunityResponseSchema>
