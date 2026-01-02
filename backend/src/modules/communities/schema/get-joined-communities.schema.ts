import z from 'zod'

import { CommunitySchema } from '@/db/tables/communities'

export const GetJoinedCommunitiesResponseSchema = z.object({
  communities: z.array(CommunitySchema),
})
