import z from 'zod'
import { EmailSchema } from '@/shared/zod'

export const RequestResetSchema = z.object({
  email: EmailSchema,
})

export type RequestResetData = z.infer<typeof RequestResetSchema>
