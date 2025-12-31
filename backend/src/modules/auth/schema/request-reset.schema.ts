import z from 'zod'

export const RequestResetSchema = z.object({
  email: z.email(),
})

export type RequestResetData = z.infer<typeof RequestResetSchema>
