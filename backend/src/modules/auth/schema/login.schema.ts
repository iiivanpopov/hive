import z from 'zod'

import { EmailSchema } from '@/shared/zod'

const USERNAME_MIN = 5
const PASSWORD_MIN = 6

export const LoginBodySchema = z.object({
  identity: z.union([EmailSchema, z.string().min(USERNAME_MIN)]),
  password: z.string().min(PASSWORD_MIN),
})

export type LoginBody = z.infer<typeof LoginBodySchema>
