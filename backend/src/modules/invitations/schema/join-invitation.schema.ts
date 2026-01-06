import z from 'zod'

import { CommunitySchema } from '@/db/tables/communities'

export const JoinInvitationParamsSchema = z.object({
  token: z.string(),
})

export type JoinInvitationParam = z.infer<typeof JoinInvitationParamsSchema>

export const JoinInvitationResponseSchema = z.object({
  community: CommunitySchema,
})
