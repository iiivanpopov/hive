import z from 'zod'

import { IdSchema } from '@/shared/zod'

export const UpdateChannelParamsSchema = z.object({
  id: IdSchema,
})

export type UpdateChannelParams = z.infer<typeof UpdateChannelParamsSchema>

export const UpdateChannelBodySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
})

export type UpdateChannelBody = z.infer<typeof UpdateChannelBodySchema>
