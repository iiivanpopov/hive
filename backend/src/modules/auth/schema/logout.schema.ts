import z from 'zod'

export const LogoutResponseSchema = z.object({
  message: z.string(),
})
