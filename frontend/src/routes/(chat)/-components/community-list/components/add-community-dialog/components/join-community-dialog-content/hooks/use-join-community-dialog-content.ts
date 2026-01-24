import { useMutation } from '@tanstack/react-query'
import z from 'zod'

import { postCommunitiesJoinTokenMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { useI18n } from '@/i18n/hooks'
import { useAddCommunityDialog } from '@/routes/(chat)/-components/community-list/providers'

const JoinCommunitySchema = z.object({
  token: z
    .string()
    .length(16, 'validation.join-token.length'),
})

const joinCommunityFormDefaultValues = {
  token: '',
}

export function useJoinCommunityDialogContent() {
  const i18n = useI18n()

  const addCommunityDialog = useAddCommunityDialog()

  const joinCommunityMutation = useMutation(postCommunitiesJoinTokenMutation())

  const joinCommunityForm = useForm({
    defaultValues: joinCommunityFormDefaultValues,
    validators: { onChange: JoinCommunitySchema },
    onSubmit: async ({ value }) => {
      await joinCommunityMutation.mutateAsync({
        path: value,
      })
    },
  })

  return {
    form: joinCommunityForm,
    features: {
      i18n,
      addCommunityDialog,
    },
  }
}
