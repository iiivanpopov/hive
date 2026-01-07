import z from 'zod'

import { MessageSchema } from '@/db/tables/messages'

export const GetChannelMessagesParamsSchema = z.object({
  id: z.string(),
})

export const GetChannelMessagesQuerySchema = z.object({
  limit: z.coerce.number(),
  before: z.coerce.number().optional(),
})

export type GetChannelMessagesParams = z.infer<typeof GetChannelMessagesParamsSchema>
export type GetChannelMessagesQuery = z.infer<typeof GetChannelMessagesQuerySchema>

export const GetChannelMessagesResponseSchema = z.object({
  messages: z.array(MessageSchema),
  hasMore: z.boolean(),
})
