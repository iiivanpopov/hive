import z from 'zod'

import { IdSchema } from '@/shared/zod'

export const CommunitySchema = z.object({
  id: IdSchema,
  ownerId: IdSchema,
  name: z.string(),
  slug: z.string(),
  createdAt: z.iso.datetime(),
})
