import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearch } from '@tanstack/react-router'
import z from 'zod'

import { postAuthResetPasswordTokenMutation } from '@/api/@tanstack/react-query.gen.ts'
import { useForm } from '@/components/form/hooks.ts'
import { useI18n } from '@/providers/i18n-provider'

const ResetPasswordFormSchema = z.object({
  newPassword: z.string().min(6, 'validation.password.min'),
  confirmPassword: z.string().min(6, 'validation.password.min'),
}).superRefine((data, ctx) => {
  if (data.newPassword !== data.confirmPassword) {
    ctx.addIssue({
      path: ['confirmPassword'],
      message: 'validation.passwords.mismatch',
      code: 'custom',
    })
  }
})

const resetPasswordFormDefaultValues = {
  newPassword: '',
  confirmPassword: '',
}

export function useResetPasswordPage() {
  const i18n = useI18n()
  const router = useRouter()
  const { redirectTo, token } = useSearch({ from: '/(auth)/reset-password/' })

  const resetPasswordMutation = useMutation(postAuthResetPasswordTokenMutation({
    meta: {
      toast: false,
    },
  }))

  const form = useForm({
    defaultValues: resetPasswordFormDefaultValues,
    validators: { onChange: ResetPasswordFormSchema },
    onSubmit: async ({ value }) => {
      if (!token)
        return

      await resetPasswordMutation.mutateAsync({
        path: { token },
        body: {
          newPassword: value.newPassword,
        },
      })

      await router.navigate({
        to: '/login',
        search: () => ({ redirectTo }),
      })
    },
  })

  return {
    form,
    mutations: {
      resetPassword: resetPasswordMutation,
    },
    state: {
      redirectTo,
      token,
    },
    features: {
      i18n,
    },
  }
}
