import z from 'zod'

import { validationConfig } from '@/config'

export const ChangePasswordBodySchema = z.object({
  currentPassword: z.string().min(validationConfig.passwordMin),
  newPassword: z.string().min(validationConfig.passwordMin),
})

export type ChangePasswordBody = z.infer<typeof ChangePasswordBodySchema>
