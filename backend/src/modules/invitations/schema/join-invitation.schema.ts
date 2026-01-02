import z from 'zod'

import { InvitationSchema } from '@/db/tables/invitations'

export const JoinInvitationParamSchema = z.object({
  token: z.string(),
})

export type JoinInvitationParam = z.infer<typeof JoinInvitationParamSchema>

export const JoinInvitationSchema = z.object({
  invitation: InvitationSchema,
})
