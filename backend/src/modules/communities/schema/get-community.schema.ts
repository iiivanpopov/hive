import z from 'zod'

import { ChannelSchema } from '@/db/tables/channels/channel.schema'
import { CommunitySchema } from '@/db/tables/communities'
import { UserDtoSchema } from '@/db/tables/users/users.schema'

export const GetCommunityParamsSchema = z.object({
  id: z.string(),
})

export type GetCommunityParams = z.infer<typeof GetCommunityParamsSchema>

export const GetCommunityResponseSchema = z.object({
  community: CommunitySchema.extend({
    channels: z.array(ChannelSchema),
    members: z.array(UserDtoSchema),
  }),
})
