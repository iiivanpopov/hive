import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import z from 'zod'

import { getCommunitiesJoinedOptions, postCommunitiesMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { useI18n } from '@/i18n/hooks/use-i18n'
import { queryClient } from '@/providers/query-provider'
import { useAddCommunityDialog } from '@/routes/(app)/-components/community-list/providers'

const CreateCommunitySchema = z.object({
  name: z
    .string()
    .min(3, 'validation.community-name.min')
    .max(20, 'validation.community-name.max'),
})

const formDefaultValues = {
  name: '',
}

export function useCreateCommunityDialogContent() {
  const i18n = useI18n()
  const router = useRouter()

  const addCommunityDialog = useAddCommunityDialog()

  const createCommunityMutation = useMutation(postCommunitiesMutation())

  const form = useForm({
    defaultValues: formDefaultValues,
    validators: { onChange: CreateCommunitySchema },
    onSubmit: async ({ value, formApi }) => {
      const { community } = await createCommunityMutation.mutateAsync({
        body: value,
      })

      if (!community)
        return

      addCommunityDialog.dialog.close()
      formApi.reset()

      router.navigate({
        to: '/c/$communityId',
        params: {
          communityId: String(community.id),
        },
      })

      queryClient.invalidateQueries(getCommunitiesJoinedOptions())
    },
  })

  return {
    form,
    features: {
      addCommunityDialog,
      i18n,
    },
  }
}
