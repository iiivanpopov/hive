import { useMutation } from '@tanstack/react-query'
import { useRouteContext, useRouter } from '@tanstack/react-router'

import { postAuthLogoutMutation } from '@/api/@tanstack/react-query.gen.ts'
import { queryClient } from '@/lib/query-client.ts'

export function useCurrentUser() {
  const { user } = useRouteContext({ from: '__root__' })
  const router = useRouter()

  const logoutMutation = useMutation(postAuthLogoutMutation())

  const onLogout = async () => {
    await logoutMutation.mutateAsync({})
    queryClient.clear()
    await router.invalidate()
  }

  return {
    state: {
      user,
    },
    functions: {
      onLogout,
    },
  }
}
