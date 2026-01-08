import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import z from 'zod'

import { postAuthLoginMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { useI18n } from '@/i18n/hooks/use-i18n'

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
  const navigate = useNavigate()
  const i18n = useI18n()

  const loginMutation = useMutation({
    ...postAuthLoginMutation(),
    onSuccess: async () => {
      await navigate({ to: '/' })
    },
  })

  const form = useForm({
    defaultValues: loginFormDefaultValues,
    validators: { onChange: LoginFormSchema },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync({ body: value })
    },
  })

  return {
    i18n,
    form,
    mutations: {
      login: loginMutation,
    },
  }
}
