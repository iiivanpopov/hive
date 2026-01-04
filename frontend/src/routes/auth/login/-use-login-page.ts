import type z from 'zod'

import { toast } from 'sonner'

import { zPostAuthLoginData } from '@/api/zod.gen'
import { useForm } from '@/components/form/hooks'

const LoginBodySchema = zPostAuthLoginData.shape.body.unwrap()
export type LoginData = z.infer<typeof LoginBodySchema>

const loginFormDefaultValues = {
  identity: '',
  password: '',
} satisfies LoginData as LoginData

export function useLoginPage() {
  const loginForm = useForm({
    defaultValues: loginFormDefaultValues,
    validators: {
      onChange: LoginBodySchema,
    },
    onSubmit: async ({ value }) => {
      toast(JSON.stringify(value))
    },
  })

  return {
    loginForm,
  }
}
