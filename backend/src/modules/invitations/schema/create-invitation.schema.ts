import z from 'zod'

import { InvitationSchema } from '@/db/schema'
import { IdSchema, IsoDateTimeSchema } from '@/shared/zod'

export const CreateInvitationBodySchema = z.object({
  expiresAt: IsoDateTimeSchema.transform(date => date ? new Date(date) : null).optional(),
})

export type CreateInvitationBody = z.infer<typeof CreateInvitationBodySchema>

export const CreateInvitationParamSchema = z.object({
  communityId: IdSchema,
})

export type CreateInvitationParam = z.infer<typeof CreateInvitationParamSchema>

export const InvitationResponseSchema = z.object({
  invitation: InvitationSchema,
})

export type InvitationResponse = z.infer<typeof InvitationResponseSchema>
