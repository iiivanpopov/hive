import { useMutation } from '@tanstack/react-query'
import { useRouteContext, useRouter } from '@tanstack/react-router'

import { postAuthLogoutMutation } from '@/api/@tanstack/react-query.gen'
import { queryClient } from '@/providers/query-provider'

export function useCurrentUser() {
  const context = useRouteContext({ from: '__root__' })
  const router = useRouter()

  const logoutMutation = useMutation({
    ...postAuthLogoutMutation(),
    onSuccess: async () => {
      queryClient.clear()
      await router.invalidate()
    },
  })

  const handleLogout = async () => {
    await logoutMutation.mutateAsync({})
  }

  return {
    state: {
      context,
    },
    functions: {
      handleLogout,
    },
  }
}
