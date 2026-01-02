import z from 'zod'

import { InvitationSchema } from '@/db/tables/invitations'

export const JoinInvitationParamsSchema = z.object({
  token: z.string(),
})

export type JoinInvitationParam = z.infer<typeof JoinInvitationParamsSchema>

export const JoinInvitationSchema = z.object({
  invitation: InvitationSchema,
})
