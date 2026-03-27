import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'

import { getCommunitiesCommunityIdInvitationsOptions, getCommunitiesCommunityIdOptions } from '@/api/@tanstack/react-query.gen'
import { useDisclosure } from '@/hooks/use-disclosure'
import { queryClient } from '@/lib/query-client'

import { useCreateInvitation } from '../../../-providers/create-invitation-provider'

export function useCommunityHeader() {
  const communityId = useParams({
    from: '/(layout)/_layout/c/$communityId/_layout/',
    select: params => params.communityId,
  })

  const communityQuery = useSuspenseQuery(getCommunitiesCommunityIdOptions({
    path: { communityId },
  }))

  const dropdownMenu = useDisclosure()
  const viewInvitations = useDisclosure()
  const createInvitation = useCreateInvitation()

  const prefetchInvitations = () => {
    queryClient.prefetchQuery({
      ...getCommunitiesCommunityIdInvitationsOptions({
        path: { communityId },
      }),
      staleTime: 60_000,
    })
  }

  return {
    queries: {
      community: communityQuery,
    },
    functions: {
      prefetchInvitations,
    },
    features: {
      dropdownMenu,
      createInvitation,
      viewInvitations,
    },
  }
}
