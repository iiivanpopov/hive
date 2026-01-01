import z from 'zod'

import { UserDtoSchema } from '@/db/schema'

export const MeResponseSchema = z.object({
  user: UserDtoSchema,
})
