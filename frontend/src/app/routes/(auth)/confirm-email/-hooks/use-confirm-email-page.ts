import { useMutation } from '@tanstack/react-query'
import { useRouteContext, useRouter, useSearch } from '@tanstack/react-router'
import z from 'zod'

import {
  getAuthMeOptions,
  postAuthConfirmEmailResendMutation,
  postAuthConfirmEmailTokenMutation,
} from '@/api/@tanstack/react-query.gen.ts'
import { useForm } from '@/components/form/hooks.ts'
import { queryClient } from '@/lib/query-client.ts'
import { EmailSchema } from '@/lib/zod.ts'
import { useI18n } from '@/providers/i18n-provider'

const ResendConfirmationFormSchema = z.object({
  email: EmailSchema,
})

export function useConfirmEmailPage() {
  const { token } = useSearch({ from: '/(auth)/confirm-email/' })
  const { user } = useRouteContext({ from: '__root__' })
  const i18n = useI18n()
  const router = useRouter()

  const confirmEmailMutation = useMutation(postAuthConfirmEmailTokenMutation({
    meta: {
      toast: false,
    },
  }))
  const resendConfirmationMutation = useMutation(postAuthConfirmEmailResendMutation())

  const form = useForm({
    defaultValues: {
      email: user?.email ?? '',
    },
    validators: { onChange: ResendConfirmationFormSchema },
    onSubmit: async ({ value, formApi }) => {
      await resendConfirmationMutation.mutateAsync({ body: value })

      if (!user)
        formApi.reset()
    },
  })

  const onConfirmEmail = async () => {
    if (!token)
      return

    await confirmEmailMutation.mutateAsync({ path: { token } })

    if (!user)
      return

    await queryClient.invalidateQueries(getAuthMeOptions())
    await router.invalidate()
  }

  const status = token
    ? confirmEmailMutation.status
    : 'error'

  return {
    form,
    mutations: {
      confirmEmail: confirmEmailMutation,
      resendConfirmation: resendConfirmationMutation,
    },
    state: {
      status,
      user,
    },
    functions: {
      onConfirmEmail,
    },
    features: {
      i18n,
    },
  }
}
