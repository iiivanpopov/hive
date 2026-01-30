import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'

import { getCommunitiesCommunityIdOptions } from '@/api/@tanstack/react-query.gen'
import { useDisclosure } from '@/hooks/use-disclosure'

import { useCreateInvitation } from '../../../-providers/create-invitation-provider'

export function useCommunityHeader() {
  const communityId = +useParams({
    from: '/(layout)/_layout/c/$communityId/_layout/',
    select: params => params.communityId,
  })

  const communityQuery = useSuspenseQuery(getCommunitiesCommunityIdOptions({
    path: { communityId },
  }))

  const dropdownMenu = useDisclosure()
  const createInvitation = useCreateInvitation()

  return {
    queries: {
      community: communityQuery,
    },
    features: {
      dropdownMenu,
      createInvitation,
    },
  }
}
