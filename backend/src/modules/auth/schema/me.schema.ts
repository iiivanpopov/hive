import z from 'zod'

import { UserDtoSchema } from '@/db/tables/users'

export const MeResponseSchema = z.object({
  user: UserDtoSchema,
})
