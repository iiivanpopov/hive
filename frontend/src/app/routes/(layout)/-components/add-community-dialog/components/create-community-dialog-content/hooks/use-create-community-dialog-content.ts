import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import z from 'zod'

import { getCommunitiesJoinedOptions, postCommunitiesMutation } from '@/api/@tanstack/react-query.gen.ts'
import {
  useAddCommunityDialog,
} from '@/app/routes/(layout)/-components/add-community-dialog/hooks'
import { useForm } from '@/components/form/hooks.ts'
import { useI18n } from '@/providers/i18n-provider/use-i18n.ts'
import { queryClient } from '@/providers/query-provider'

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
