import z from 'zod'

import { validationConfig } from '@/config'
import { UserDtoSchema } from '@/db/tables/users'

export const UpdateProfileBodySchema = z.object({
  name: z.optional(z.string().trim().max(50).transform(value => value || null)),
  username: z.string().trim().min(validationConfig.minUsername),
})

export type UpdateProfileBody = z.infer<typeof UpdateProfileBodySchema>

export const UpdateProfileResponseSchema = z.object({
  user: UserDtoSchema,
})

export type UpdateProfileResponse = z.infer<typeof UpdateProfileResponseSchema>
