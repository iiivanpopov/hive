import z from 'zod'

import { UserDtoSchema } from '@/db/tables/users'
import { IdSchema } from '@/shared/zod'

export const GetCommunityMembersParamsSchema = z.object({
  communityId: IdSchema,
})

export type GetCommunityMembersParam = z.infer<typeof GetCommunityMembersParamsSchema>

export const GetCommunityMembersResponseSchema = z.object({
  members: z.array(UserDtoSchema),
})
