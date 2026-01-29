import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import z from 'zod'

import { getAuthMeOptions, postAuthLoginMutation } from '@/api/@tanstack/react-query.gen.ts'
import { useForm } from '@/components/form/hooks.ts'
import { queryClient } from '@/lib/query-client.ts'
import { useI18n } from '@/providers/i18n-provider'

const LoginFormSchema = z.object({
  identity: z.string().min(5, 'validation.identity.min'),
  password: z.string().min(6, 'validation.password.min'),
})
export type LoginFormData = z.infer<typeof LoginFormSchema>

const loginFormDefaultValues = {
  identity: '',
  password: '',
}

export function useLoginPage() {
  const router = useRouter()
  const i18n = useI18n()

  const loginMutation = useMutation(postAuthLoginMutation())

  const form = useForm({
    defaultValues: loginFormDefaultValues,
    validators: { onChange: LoginFormSchema },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync({ body: value })

      await queryClient.invalidateQueries(getAuthMeOptions())
      await router.invalidate()
    },
  })

  return {
    form,
    mutations: {
      login: loginMutation,
    },
    features: {
      i18n,
    },
  }
}
