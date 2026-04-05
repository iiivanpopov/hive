import z from 'zod'

import { useForm } from '@/components/form/hooks'
import { useI18n } from '@/providers/i18n-provider'

const CreateChannelSchema = z.object({
  name: z
    .string()
    .min(3, 'validation.channel-name.min')
    .max(20, 'validation.channel-name.max'),
  description: z
    .string()
    .max(500, 'validation.channel-description.max'),
})

export interface UseCreateChannelDialogProps {
  onSubmit: (value: { name: string, description: string }) => Promise<void>
}

export function useCreateChannelDialog({ onSubmit }: UseCreateChannelDialogProps) {
  const i18n = useI18n()

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
    validators: {
      onChange: CreateChannelSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  return {
    form,
    features: {
      i18n,
    },
  }
}
