import z from 'zod'

import { EmailSchema } from '@/shared/zod'

export const ConfirmParamsSchema = z.object({
  token: z.uuidv4(),
})

export type ConfirmParams = z.infer<typeof ConfirmParamsSchema>

export const ConfirmEmailResendBodySchema = z.object({
  email: EmailSchema,
})
