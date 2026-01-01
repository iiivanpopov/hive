import z from 'zod'

import { validationConfig } from '@/config'

export const ResetPasswordParamsSchema = z.object({
  token: z.uuidv4(),
})

export type ResetPasswordParams = z.infer<typeof ResetPasswordParamsSchema>

export const ResetPasswordBodySchema = z.object({
  newPassword: z.string().min(validationConfig.passwordMin),
})

export type ResetPasswordBody = z.infer<typeof ResetPasswordBodySchema>
