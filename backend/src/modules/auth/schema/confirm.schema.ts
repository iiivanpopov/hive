import z from 'zod'

const TOKEN_LENGTH = 32

export const ConfirmParamsSchema = z.object({
  token: z.string().length(TOKEN_LENGTH),
})
