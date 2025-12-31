import z from 'zod'
import { EmailSchema } from '@/shared/zod'

const USERNAME_MIN = 5
const PASSWORD_MIN = 6

export const RegisterBodySchema = z.object({
  username: z.string().min(USERNAME_MIN),
  email: EmailSchema,
  password: z.string().min(PASSWORD_MIN),
})

export type RegisterBody = z.infer<typeof RegisterBodySchema>
