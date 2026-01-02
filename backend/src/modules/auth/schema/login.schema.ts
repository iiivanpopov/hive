import z from 'zod'

import { validationConfig } from '@/config'
import { EmailSchema } from '@/shared/zod'

export const LoginBodySchema = z.object({
  identity: z.union([EmailSchema, z.string().min(validationConfig.minUsername)]),
  password: z.string().min(validationConfig.passwordMin),
})

export type LoginBody = z.infer<typeof LoginBodySchema>
