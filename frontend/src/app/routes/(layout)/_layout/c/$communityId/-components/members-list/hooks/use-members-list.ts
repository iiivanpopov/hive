import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'

import { getCommunitiesCommunityIdMembersOptions } from '@/api/@tanstack/react-query.gen'

export function useMembersList() {
  const communityId = useParams({
    from: '/(layout)/_layout/c/$communityId/_layout',
    select: params => params.communityId,
  })

  const membersQuery = useSuspenseQuery(getCommunitiesCommunityIdMembersOptions({
    path: { communityId },
  }))

  return {
    queries: {
      members: membersQuery,
    },
  }
}
