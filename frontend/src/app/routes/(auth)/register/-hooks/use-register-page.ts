import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import z from 'zod'

import { getAuthMeOptions, postAuthRegisterMutation } from '@/api/@tanstack/react-query.gen.ts'
import { useForm } from '@/components/form/hooks.ts'
import { queryClient } from '@/lib/query-client.ts'
import { EmailSchema } from '@/lib/zod.ts'
import { useI18n } from '@/providers/i18n-provider'

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
      message: 'validation.passwords.mismatch',
      code: 'custom',
    })
    ctx.addIssue({
      path: ['password'],
      message: 'validation.passwords.mismatch',
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
  const router = useRouter()

  const registerMutation = useMutation(postAuthRegisterMutation())

  const form = useForm({
    defaultValues: registerFormDefaultValues,
    validators: { onChange: RegisterFormSchema },
    onSubmit: async ({ value }) => {
      await registerMutation.mutateAsync({ body: value })

      await queryClient.invalidateQueries(getAuthMeOptions())
      await router.invalidate()
    },
  })

  return {
    form,
    mutations: {
      register: registerMutation,
    },
    features: {
      i18n,
    },
  }
}
