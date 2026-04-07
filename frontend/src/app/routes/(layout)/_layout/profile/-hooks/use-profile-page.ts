import { useMutation } from '@tanstack/react-query'
import { useRouteContext, useRouter } from '@tanstack/react-router'
import z from 'zod'

import {
  getAuthMeQueryKey,
  patchAuthChangePasswordMutation,
  patchAuthMeMutation,
  postAuthConfirmEmailResendMutation,
  postAuthRequestResetMutation,
} from '@/api/@tanstack/react-query.gen.ts'
import { useForm } from '@/components/form/hooks.ts'
import { queryClient } from '@/lib/query-client.ts'
import { useI18n } from '@/providers/i18n-provider'

const ProfileFormSchema = z.object({
  name: z.string().max(50, 'validation.name.max'),
  username: z.string().min(5, 'validation.username.min'),
})

const ChangePasswordFormSchema = z.object({
  currentPassword: z.string().min(6, 'validation.password.min'),
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

const changePasswordDefaultValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export function useProfilePage() {
  const { user } = useRouteContext({ from: '__root__' })
  const router = useRouter()
  const i18n = useI18n()

  const updateProfileMutation = useMutation(patchAuthMeMutation())
  const changePasswordMutation = useMutation(patchAuthChangePasswordMutation())
  const resendConfirmationMutation = useMutation(postAuthConfirmEmailResendMutation())
  const requestResetMutation = useMutation(postAuthRequestResetMutation())

  const profileForm = useForm({
    defaultValues: {
      name: user!.name ?? undefined,
      username: user!.username,
    },
    validators: { onChange: ProfileFormSchema },
    onSubmit: async ({ value }) => {
      const result = await updateProfileMutation.mutateAsync({
        body: value,
      })

      queryClient.setQueryData(getAuthMeQueryKey(), {
        user: result.user,
      })

      await router.invalidate()
    },
  })

  const passwordForm = useForm({
    defaultValues: changePasswordDefaultValues,
    validators: { onChange: ChangePasswordFormSchema },
    onSubmit: async ({ value, formApi }) => {
      await changePasswordMutation.mutateAsync({
        body: {
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        },
      })

      formApi.reset()
    },
  })

  const onResendConfirmation = async () => {
    await resendConfirmationMutation.mutateAsync({
      body: {
        email: user!.email,
      },
    })
  }

  const onSendPasswordSetupLink = async () => {
    await requestResetMutation.mutateAsync({
      body: {
        email: user!.email,
      },
    })
  }

  return {
    forms: {
      profile: profileForm,
      password: passwordForm,
    },
    mutations: {
      updateProfile: updateProfileMutation,
      changePassword: changePasswordMutation,
      resendConfirmation: resendConfirmationMutation,
      requestReset: requestResetMutation,
    },
    state: {
      user,
    },
    functions: {
      onResendConfirmation,
      onSendPasswordSetupLink,
    },
    features: {
      i18n,
    },
  }
}
