import z from 'zod'

import { validationConfig } from '@/config'
import { EmailSchema } from '@/shared/zod'

export const RegisterBodySchema = z.object({
  username: z.string().min(validationConfig.minUsername),
  email: EmailSchema,
  password: z.string().min(validationConfig.minPassword),
})

export type RegisterBody = z.infer<typeof RegisterBodySchema>
