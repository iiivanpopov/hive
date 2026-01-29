import { useMutation } from '@tanstack/react-query'
import { useRouteContext, useRouter } from '@tanstack/react-router'

import { postAuthLogoutMutation } from '@/api/@tanstack/react-query.gen.ts'
import { queryClient } from '@/providers/query-provider'

export function useCurrentUser() {
  const context = useRouteContext({ from: '__root__' })
  const router = useRouter()

  const logoutMutation = useMutation(postAuthLogoutMutation())

  const onLogout = () => {
    logoutMutation.mutate({})
    queryClient.clear()
    router.invalidate()
  }

  return {
    state: {
      context,
    },
    functions: {
      onLogout,
    },
  }
}
