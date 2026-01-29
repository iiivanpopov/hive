import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import z from 'zod'

import { postCommunitiesJoinTokenMutation } from '@/api/@tanstack/react-query.gen.ts'
import { useAddCommunityDialog } from '@/app/routes/(layout)/-components/add-community-dialog/hooks'
import { useForm } from '@/components/form/hooks.ts'
import { useI18n } from '@/providers/i18n-provider'

const JoinCommunitySchema = z.object({
  token: z
    .string()
    .length(16, 'validation.join-token.length'),
})

const formDefaultValues = {
  token: '',
}

export function useJoinCommunityDialogContent() {
  const i18n = useI18n()
  const router = useRouter()

  const addCommunityDialog = useAddCommunityDialog()

  const joinCommunityMutation = useMutation(postCommunitiesJoinTokenMutation())

  const form = useForm({
    defaultValues: formDefaultValues,
    validators: { onChange: JoinCommunitySchema },
    onSubmit: async ({ value, formApi }) => {
      const mutation = await joinCommunityMutation.mutateAsync({
        path: value,
      })

      formApi.reset()
      addCommunityDialog.dialog.close()

      router.navigate({
        to: '/c/$communityId',
        params: {
          communityId: String(mutation.community.id),
        },
      })
    },
  })

  return {
    form,
    features: {
      i18n,
      addCommunityDialog,
    },
  }
}
