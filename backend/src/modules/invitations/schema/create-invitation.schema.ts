import z from 'zod'

import { InvitationSchema } from '@/db/tables/invitations'
import { IdSchema } from '@/shared/zod'

export const CreateInvitationBodySchema = z.object({
  expiresAt: z.iso.datetime().optional(),
})

export type CreateInvitationBody = z.infer<typeof CreateInvitationBodySchema>

export const CreateInvitationParamSchema = z.object({
  communityId: IdSchema,
})

export type CreateInvitationParam = z.infer<typeof CreateInvitationParamSchema>

export const CreateInvitationResponseSchema = z.object({
  invitation: InvitationSchema,
})
