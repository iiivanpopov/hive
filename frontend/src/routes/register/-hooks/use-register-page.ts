import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import z from 'zod'

import { postAuthRegisterMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { useI18n } from '@/i18n/hooks/use-i18n'
import { EmailSchema } from '@/lib/zod'

const RegisterFormSchema = z.object({
  email: EmailSchema,
  username: z
    .string()
    .min(5, 'validation.username.min'),
  password: z
    .string()
    .min(6, 'validation.password.min'),
  confirmPassword: z
    .string()
    .min(6, 'validation.password.min'),
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
}

export function useRegisterPage() {
  const i18n = useI18n()
  const navigate = useNavigate()

  const registerMutation = useMutation({
    ...postAuthRegisterMutation(),
    onSuccess: async () => {
      await navigate({ to: '/' })
    },
  })

  const form = useForm({
    defaultValues: registerFormDefaultValues,
    validators: { onChange: RegisterFormSchema },
    onSubmit: async ({ value }) => {
      await registerMutation.mutateAsync({
        body: value,
      })
    },
  })

  return {
    i18n,
    form,
    mutations: {
      register: registerMutation,
    },
  }
}
