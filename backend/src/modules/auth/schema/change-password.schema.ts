import z from 'zod'

import { validationConfig } from '@/config'

export const ChangePasswordBodySchema = z.object({
  currentPassword: z.string().min(validationConfig.minPassword),
  newPassword: z.string().min(validationConfig.minPassword),
})

export type ChangePasswordBody = z.infer<typeof ChangePasswordBodySchema>
