import z from 'zod'

import { IdSchema } from '@/shared/zod'

export const DeleteInvitationParamsSchema = z.object({
  id: IdSchema,
})

export type DeleteInvitationParam = z.infer<typeof DeleteInvitationParamsSchema>
