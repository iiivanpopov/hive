import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import z from 'zod'

import { postAuthRegisterMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { EmailSchema } from '@/shared/zod'

const RegisterSchema = z.object({
  email: EmailSchema,
  username: z
    .string()
    .min(5, 'validation.username.min'),
  password: z.string().min(6, 'validation.password.min'),
  confirmPassword: z.string().min(6, 'validation.password.min'),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      path: ['confirmPassword'],
      message: 'validation.passwords-do-not-match',
      code: 'custom',
    })
    ctx.addIssue({
      path: ['password'],
      message: 'validation.passwords-do-not-match',
      code: 'custom',
    })
  }
})
export type RegisterData = z.infer<typeof RegisterSchema>

const registerFormDefaultValues = {
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
} satisfies RegisterData

export function useRegisterPage() {
  const navigate = useNavigate()

  const registerMutation = useMutation({
    ...postAuthRegisterMutation(),
    onSuccess: () => {
      navigate({ to: '/' })
    },
  })

  const registerForm = useForm({
    defaultValues: registerFormDefaultValues,
    validators: {
      onChange: RegisterSchema,
    },
    onSubmit: async ({ value }) => {
      registerMutation.mutate({
        body: {
          email: value.email,
          username: value.username,
          password: value.password,
        },
      })
    },
  })

  return {
    registerForm,
    registerMutation,
  }
}
