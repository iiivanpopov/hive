import z from 'zod'

import { InvitationSchema } from '@/db/schema'
import { IdSchema } from '@/shared/zod'

export const CreateInvitationBodySchema = z.object({
  expiresAt: z.coerce.date().optional(),
})

export type CreateInvitationBody = z.infer<typeof CreateInvitationBodySchema>

export const CreateInvitationParamSchema = z.object({
  communityId: IdSchema,
})

export type CreateInvitationParam = z.infer<typeof CreateInvitationParamSchema>

export const CreateInvitationResponseSchema = z.object({
  invitation: InvitationSchema,
})
