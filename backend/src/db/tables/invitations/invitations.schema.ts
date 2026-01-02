import z from 'zod'

import { IdSchema } from '@/shared/zod'

export const InvitationSchema = z.object({
  id: IdSchema,
  communityId: IdSchema,
  token: z.string(),
  expiresAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
})
