import z from 'zod'

import { IdSchema } from '@/shared/zod'

export const UserDtoSchema = z.object({
  id: IdSchema,
  name: z.string().nullable(),
  username: z.string(),
  email: z.email(),
  emailConfirmed: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type UserDto = z.infer<typeof UserDtoSchema>
