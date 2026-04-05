import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'

import { deleteInvitationsInvitationIdMutation, getCommunitiesCommunityIdInvitationsOptions } from '@/api/@tanstack/react-query.gen'
import { queryClient } from '@/lib/query-client'

export function useInvitationsDialog() {
  const communityId = useParams({
    from: '/(layout)/_layout/c/$communityId/_layout',
    select: params => params.communityId,
  })

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

  const formatDateTime = (value: string) => {
    const date = new Date(value)

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
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
      deleteInvitation,
      formatDateTime,
    },
  }
}
