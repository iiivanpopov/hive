import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import z from 'zod'

import { postAuthLoginMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'

const LoginBodySchema = z.object({
  identity: z.union([
    z.email(),
    z.string().min(5),
  ], 'validation.identity'),
  password: z.string().min(6, 'validation.password.min'),
})
export type LoginData = z.infer<typeof LoginBodySchema>

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
      onChange: LoginBodySchema,
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
