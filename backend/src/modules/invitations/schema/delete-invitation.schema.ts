import z from 'zod'

import { InvitationSchema } from '@/db/tables/invitations'
import { IdSchema } from '@/shared/zod'

export const DeleteInvitationParamsSchema = z.object({
  invitationId: IdSchema,
})

export type DeleteInvitationParam = z.infer<typeof DeleteInvitationParamsSchema>

export const DeleteInvitationResponseSchema = z.object({
  invitation: InvitationSchema,
})
