import { useCopy } from '@siberiacancode/reactuse'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'

import { deleteInvitationsInvitationIdMutation, getCommunitiesCommunityIdInvitationsOptions } from '@/api/@tanstack/react-query.gen'
import { getInvitationUrl } from '@/lib/invitations'
import { queryClient } from '@/lib/query-client'
import { useI18n } from '@/providers/i18n-provider'

export function useInvitationsDialog() {
  const communityId = useParams({
    from: '/(layout)/_layout/c/$communityId/_layout',
    select: params => params.communityId,
  })
  const i18n = useI18n()
  const clipboard = useCopy(1000)

  const invitationsQueryOptions = getCommunitiesCommunityIdInvitationsOptions({
    path: { communityId },
  })
  const invitationsQuery = useQuery({
    ...invitationsQueryOptions,
    staleTime: 60_000,
  })
  const invitations = invitationsQuery.data?.invitations ?? []
  const deleteInvitationMutation = useMutation(deleteInvitationsInvitationIdMutation())

  const deleteInvitation = async (invitationId: number) => {
    await deleteInvitationMutation.mutateAsync({
      path: { invitationId },
    })

    await queryClient.invalidateQueries(invitationsQueryOptions)
  }

  const copyInvitation = async (token: string) => {
    await clipboard.copy(getInvitationUrl(token))
  }

  return {
    state: {
      invitations,
    },
    queries: {
      invitations: invitationsQuery,
    },
    mutations: {
      deleteInvitation: deleteInvitationMutation,
    },
    functions: {
      copyInvitation,
      getInvitationUrl,
      deleteInvitation,
    },
    features: {
      clipboard,
      i18n,
    },
  }
}
