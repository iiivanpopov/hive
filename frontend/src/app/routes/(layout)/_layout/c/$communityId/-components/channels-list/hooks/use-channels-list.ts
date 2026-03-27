import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'

import { getCommunitiesCommunityIdChannelsOptions } from '@/api/@tanstack/react-query.gen'

export function useChannelsList() {
  const communityId = useParams({
    from: '/(layout)/_layout/c/$communityId/_layout/',
    select: params => params.communityId,
  })

  const channelsQuery = useSuspenseQuery(getCommunitiesCommunityIdChannelsOptions({
    path: { communityId },
  }))

  return {
    queries: {
      channels: channelsQuery,
    },
  }
}
