import z from 'zod'

import { EmailSchema, IdSchema } from '@/shared/zod'

export const UserDtoSchema = z.object({
  id: IdSchema,
  name: z.string().nullable(),
  username: z.string(),
  email: EmailSchema,
  emailConfirmed: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type UserDto = z.infer<typeof UserDtoSchema>
