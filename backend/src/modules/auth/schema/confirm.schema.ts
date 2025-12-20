import z from 'zod'

export const ConfirmParamsSchema = z.object({
  token: z.string().length(32),
})
