import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import z from 'zod'

import { postAuthRegisterMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { useI18n } from '@/providers/i18n-provider'
import { EmailSchema } from '@/shared/zod'

const RegisterFormSchema = z.object({
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
export type RegisterFormData = z.infer<typeof RegisterFormSchema>

const registerFormDefaultValues = {
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
} satisfies RegisterFormData

export function useRoute() {
  const navigate = useNavigate()
  const i18n = useI18n()

  const registerMutation = useMutation({
    ...postAuthRegisterMutation(),
    onSuccess: async () => {
      await navigate({ to: '/' })
    },
  })

  const registerForm = useForm({
    defaultValues: registerFormDefaultValues,
    validators: {
      onChange: RegisterFormSchema,
    },
    onSubmit: async ({ value }) => {
      await registerMutation.mutateAsync({
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
    i18n,
  }
}
