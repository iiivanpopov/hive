import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import z from 'zod'

import { getCommunitiesJoinedQueryKey, postCommunitiesMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { useI18n } from '@/i18n/hooks/use-i18n'

const CreateCommunitySchema = z.object({
  name: z
    .string()
    .min(3, 'validation.community-name.min')
    .max(20, 'validation.community-name.max'),
})

const createCommunityFormDefaultValues = {
  name: '',
}

interface UseCreateCommunityDialogProps {
  onOpenChange: (open: boolean) => void
}

export function useCreateCommunityDialog({ onOpenChange }: UseCreateCommunityDialogProps) {
  const i18n = useI18n()

  const context = useRouteContext({ from: '/(chat)/_layout' })

  const createCommunityMutation = useMutation({
    ...postCommunitiesMutation(),
    onMutate: async (newCommunity) => {
      const queryKey = getCommunitiesJoinedQueryKey()

      await context.queryClient.cancelQueries({ queryKey })

      const previousCommunities = context.queryClient.getQueryData(queryKey)

      context.queryClient.setQueryData(
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
        context.queryClient.setQueryData(
          getCommunitiesJoinedQueryKey(),
          onMutateResult.previousCommunities,
        )
      }
    },
    onSettled: () => {
      context.queryClient.invalidateQueries({
        queryKey: getCommunitiesJoinedQueryKey(),
      })
    },
    onSuccess: () => {
      onOpenChange(false)
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
    form: createCommunityForm,
    i18n,
  }
}
