import { useMutation } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import z from 'zod'

import { getCommunitiesCommunityIdInvitationsOptions, postCommunitiesCommunityIdInvitationsMutation } from '@/api/@tanstack/react-query.gen'
import { useCreateInvitation } from '@/app/routes/(layout)/_layout/c/$communityId/-providers/create-invitation-provider'
import { useForm } from '@/components/form/hooks'
import { queryClient } from '@/lib/query-client'
import { useI18n } from '@/providers/i18n-provider'

const CreateInvitationSchema = z.object({
  expiresAt: z.optional(z.date().min(Date.now(), 'validation.expires-at.future')),
})

type CreateInvitationFormData = z.infer<typeof CreateInvitationSchema>

const formDefaultValues: CreateInvitationFormData = {
  expiresAt: (() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow
  })(),
}

export function useCreateInvitationScreen() {
  const i18n = useI18n()
  const communityId = useParams({
    from: '/(layout)/_layout/c/$communityId/_layout/',
    select: params => params.communityId,
  })

  const { setInvitation, setScreen } = useCreateInvitation()

  const createInvitationMutation = useMutation(postCommunitiesCommunityIdInvitationsMutation())

  const form = useForm({
    defaultValues: formDefaultValues,
    validators: { onChange: CreateInvitationSchema },
    onSubmit: async ({ value, formApi }) => {
      const mutation = await createInvitationMutation.mutateAsync({
        path: { communityId },
        body: {
          expiresAt: value.expiresAt?.toISOString(),
        },
      })

      await queryClient.invalidateQueries(
        getCommunitiesCommunityIdInvitationsOptions({
          path: { communityId },
        }),
      )

      setInvitation(mutation.invitation.token)
      setScreen('view')

      formApi.reset()
    },
  })

  return {
    form,
    features: {
      i18n,
    },
  }
}
