import z from 'zod'

import { useForm } from '@/components/form/hooks'
import { useI18n } from '@/providers/i18n-provider'

import type { ChannelListItem } from '../../hooks/use-channels-list'

const UpdateChannelSchema = z.object({
  name: z
    .string()
    .min(3, 'validation.channel-name.min')
    .max(20, 'validation.channel-name.max'),
  description: z
    .string()
    .max(500, 'validation.channel-description.max'),
})

export interface UseUpdateChannelDialogProps {
  channel: ChannelListItem | null
  onSubmit: (value: { name: string, description: string }) => Promise<void>
}

export function useUpdateChannelDialog({ channel, onSubmit }: UseUpdateChannelDialogProps) {
  const i18n = useI18n()

  const form = useForm({
    defaultValues: {
      name: channel?.name ?? '',
      description: channel?.description ?? '',
    },
    validators: {
      onChange: UpdateChannelSchema,
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
