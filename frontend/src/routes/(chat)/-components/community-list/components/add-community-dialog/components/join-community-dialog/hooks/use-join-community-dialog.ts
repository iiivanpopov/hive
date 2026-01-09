import { useMutation } from '@tanstack/react-query'
import z from 'zod'

import { postCommunitiesJoinTokenMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { useI18n } from '@/i18n/hooks/use-i18n'

const JoinCommunitySchema = z.object({
  token: z
    .string()
    .length(16, 'validation.join-token.length'),
})

const joinCommunityFormDefaultValues = {
  token: '',
}

interface UseJoinCommunityDialogProps {
  onOpenChange: (open: boolean) => void
}

export function useCreateCommunityDialog({ onOpenChange }: UseJoinCommunityDialogProps) {
  const i18n = useI18n()

  const joinCommunityMutation = useMutation({
    ...postCommunitiesJoinTokenMutation(),
    onSuccess: () => {
      onOpenChange(false)
    },
  })

  const joinCommunityForm = useForm({
    defaultValues: joinCommunityFormDefaultValues,
    validators: { onChange: JoinCommunitySchema },
    onSubmit: async ({ value, formApi }) => {
      const mutation = await joinCommunityMutation.mutateAsync({
        path: value,
      })

      if (mutation.community)
        formApi.reset()
    },
  })

  return {
    form: joinCommunityForm,
    i18n,
  }
}
