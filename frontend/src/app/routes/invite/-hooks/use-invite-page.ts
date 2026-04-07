import { useParams, useRouteContext, useRouter } from '@tanstack/react-router'

import { getInvitationPath } from '@/lib/invitations'

export function useInvitePage() {
  const { token } = useParams({ from: '/invite/$token' })
  const { user } = useRouteContext({ from: '__root__' })
  const { joinCommunityError } = useRouteContext({ from: '/invite/$token' })
  const router = useRouter()

  const redirectTo = getInvitationPath(token)

  const onRetry = async () => {
    await router.invalidate()
  }

  return {
    state: {
      joinCommunityError,
      redirectTo,
      user,
    },
    functions: {
      onRetry,
    },
  }
}
