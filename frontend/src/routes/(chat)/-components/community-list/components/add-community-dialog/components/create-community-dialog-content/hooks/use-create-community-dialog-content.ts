import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import z from 'zod'

import { getCommunitiesJoinedQueryKey, postCommunitiesMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { useI18n } from '@/routes/-contexts/i18n/use-i18n'
import { queryClient } from '@/routes/-contexts/query'

const CreateCommunitySchema = z.object({
  name: z
    .string()
    .min(3, 'validation.community-name.min')
    .max(20, 'validation.community-name.max'),
})

const createCommunityFormDefaultValues = {
  name: '',
}

export function useCreateCommunityDialogContent() {
  const i18n = useI18n()
  const context = useRouteContext({ from: '/(chat)/_layout' })

  const createCommunityMutation = useMutation({
    ...postCommunitiesMutation(),
    onMutate: async (newCommunity) => {
      const queryKey = getCommunitiesJoinedQueryKey()

      await queryClient.cancelQueries({ queryKey })

      const previousCommunities = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(
        queryKey,
        (old: any) => {
          if (!old)
            return old

          return {
            ...old,
            communities: [
              ...old.communities,
              {
                id: Math.random(),
                name: newCommunity.body!.name,
                ownerId: context.user?.id,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        },
      )

      return { previousCommunities }
    },
    onError: (_err, _newCommunity, onMutateResult) => {
      if (onMutateResult?.previousCommunities) {
        queryClient.setQueryData(
          getCommunitiesJoinedQueryKey(),
          onMutateResult.previousCommunities,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getCommunitiesJoinedQueryKey(),
      })
    },
  })

  const createCommunityForm = useForm({
    defaultValues: createCommunityFormDefaultValues,
    validators: { onChange: CreateCommunitySchema },
    onSubmit: async ({ value, formApi }) => {
      const mutation = await createCommunityMutation.mutateAsync({
        body: value,
      })

      if (mutation.community)
        formApi.reset()
    },
  })

  return {
    features: {
      i18n,
    },
    form: createCommunityForm,
  }
}
