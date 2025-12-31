import z from 'zod'

export const ResetPasswordParamsSchema = z.object({
  token: z.uuidv4(),
})

const PASSWORD_MIN = 6

export const ResetPasswordBodySchema = z.object({
  newPassword: z.string().min(PASSWORD_MIN),
})

export type ResetPasswordParams = z.infer<typeof ResetPasswordParamsSchema>
export type ResetPasswordBody = z.infer<typeof ResetPasswordBodySchema>
