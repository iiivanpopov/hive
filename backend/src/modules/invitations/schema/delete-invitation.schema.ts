import z from 'zod'

import { IdSchema } from '@/shared/zod'

export const DeleteInvitationParamSchema = z.object({
  id: IdSchema,
})

export type DeleteInvitationParam = z.infer<typeof DeleteInvitationParamSchema>
