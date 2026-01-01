import z from 'zod'

const PASSWORD_MIN = 6

export const ChangePasswordBodySchema = z.object({
  currentPassword: z.string().min(PASSWORD_MIN),
  newPassword: z.string().min(PASSWORD_MIN),
})

export type ChangePasswordBody = z.infer<typeof ChangePasswordBodySchema>
