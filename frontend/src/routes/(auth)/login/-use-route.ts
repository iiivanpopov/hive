import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import z from 'zod'

import { postAuthLoginMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { useI18n } from '@/providers/i18n-provider'
import { EmailSchema } from '@/shared/zod'

const LoginFormSchema = z.object({
  identity: z.union([
    EmailSchema,
    z.string().min(5),
  ], 'validation.identity'),
  password: z.string().min(6, 'validation.password.min'),
})
export type LoginFormData = z.infer<typeof LoginFormSchema>

const loginFormDefaultValues = {
  identity: '',
  password: '',
} satisfies LoginFormData

export function useRoute() {
  const navigate = useNavigate()
  const i18n = useI18n()

  const loginMutation = useMutation({
    ...postAuthLoginMutation(),
    onSuccess: () => {
      navigate({ to: '/' })
    },
  })

  const loginForm = useForm({
    defaultValues: loginFormDefaultValues,
    validators: {
      onChange: LoginFormSchema,
    },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync({ body: value })
    },
  })

  return {
    loginForm,
    loginMutation,
    i18n,
  }
}
