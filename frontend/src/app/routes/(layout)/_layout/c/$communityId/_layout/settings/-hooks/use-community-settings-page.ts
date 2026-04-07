import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useParams, useRouter } from '@tanstack/react-router'
import z from 'zod'

import { deleteCommunitiesCommunityIdMutation, getCommunitiesCommunityIdOptions, getCommunitiesJoinedOptions, patchCommunitiesCommunityIdMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { useDisclosure } from '@/hooks/use-disclosure'
import { queryClient } from '@/lib/query-client'
import { useI18n } from '@/providers/i18n-provider'

const UpdateCommunitySchema = z.object({
  name: z
    .string()
    .min(3, 'validation.community-name.min')
    .max(20, 'validation.community-name.max'),
})

export function useCommunitySettingsPage() {
  const router = useRouter()
  const i18n = useI18n()
  const deleteDialog = useDisclosure()
  const communityId = useParams({
    from: '/(layout)/_layout/c/$communityId/_layout/settings/',
    select: params => params.communityId,
  })

  const communityQueryOptions = getCommunitiesCommunityIdOptions({
    path: { communityId },
  })
  const communityQuery = useSuspenseQuery(communityQueryOptions)

  const updateCommunityMutation = useMutation(patchCommunitiesCommunityIdMutation())
  const deleteCommunityMutation = useMutation(deleteCommunitiesCommunityIdMutation())

  const communityForm = useForm({
    defaultValues: {
      name: communityQuery.data.community.name,
    },
    validators: {
      onChange: UpdateCommunitySchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const { community } = await updateCommunityMutation.mutateAsync({
        path: { communityId },
        body: value,
      })

      formApi.reset({ name: community.name })

      await Promise.all([
        queryClient.invalidateQueries(communityQueryOptions),
        queryClient.invalidateQueries(getCommunitiesJoinedOptions()),
      ])

      await router.invalidate()
    },
  })

  const deleteCommunity = async () => {
    await deleteCommunityMutation.mutateAsync({
      path: { communityId },
    })

    deleteDialog.close()

    await queryClient.invalidateQueries(getCommunitiesJoinedOptions())
    await router.navigate({ to: '/' })
  }

  return {
    forms: {
      community: communityForm,
    },
    mutations: {
      updateCommunity: updateCommunityMutation,
      deleteCommunity: deleteCommunityMutation,
    },
    state: {
      community: communityQuery.data.community,
    },
    functions: {
      deleteCommunity,
    },
    features: {
      i18n,
      deleteDialog,
    },
  }
}
