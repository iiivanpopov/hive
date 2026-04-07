import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import z from 'zod'

import { postAuthRequestResetMutation } from '@/api/@tanstack/react-query.gen.ts'
import { useForm } from '@/components/form/hooks.ts'
import { EmailSchema } from '@/lib/zod.ts'
import { useI18n } from '@/providers/i18n-provider'

const RecoveryFormSchema = z.object({
  email: EmailSchema,
})

const recoveryFormDefaultValues = {
  email: '',
}

export function useRecoveryPage() {
  const i18n = useI18n()
  const [hasRequestedReset, setHasRequestedReset] = useState(false)

  const requestResetMutation = useMutation(postAuthRequestResetMutation())

  const form = useForm({
    defaultValues: recoveryFormDefaultValues,
    validators: { onChange: RecoveryFormSchema },
    onSubmit: async ({ value, formApi }) => {
      await requestResetMutation.mutateAsync({ body: value })

      formApi.reset()
      setHasRequestedReset(true)
    },
  })

  return {
    form,
    mutations: {
      requestReset: requestResetMutation,
    },
    state: {
      hasRequestedReset,
    },
    features: {
      i18n,
    },
  }
}
