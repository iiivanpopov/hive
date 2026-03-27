import z from 'zod'

import { InvitationSchema } from '@/db/tables/invitations'
import { IdSchema } from '@/shared/zod'

export const GetCommunityInvitationsParamsSchema = z.object({
  communityId: IdSchema,
})

export type GetCommunityInvitationsParam = z.infer<typeof GetCommunityInvitationsParamsSchema>

export const GetCommunityInvitationsResponseSchema = z.object({
  invitations: z.array(InvitationSchema),
})
