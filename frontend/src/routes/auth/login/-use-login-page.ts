import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import z from 'zod'

import { postAuthLoginMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { EmailSchema } from '@/shared/zod'

const LoginSchema = z.object({
  identity: z.union([
    EmailSchema,
    z.string().min(5),
  ], 'validation.identity'),
  password: z.string().min(6, 'validation.password.min'),
})
export type LoginData = z.infer<typeof LoginSchema>

const loginFormDefaultValues = {
  identity: '',
  password: '',
} satisfies LoginData

export function useLoginPage() {
  const navigate = useNavigate()

  const loginMutation = useMutation({
    ...postAuthLoginMutation(),
    onSuccess: () => {
      navigate({ to: '/' })
    },
  })

  const loginForm = useForm({
    defaultValues: loginFormDefaultValues,
    validators: {
      onChange: LoginSchema,
    },
    onSubmit: async ({ value }) => {
      loginMutation.mutate({ body: value })
    },
  })

  return {
    loginForm,
    loginMutation,
  }
}
