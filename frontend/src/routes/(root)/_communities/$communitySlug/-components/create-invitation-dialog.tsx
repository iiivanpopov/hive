import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import z from 'zod'

import { getCommunitiesIdOptions, getCommunitiesIdQueryKey, postCommunitiesIdInvitationsMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { I18nText } from '@/components/i18n/i18n-text'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { toDate } from '@/lib/utils/to-date'
import { useI18n } from '@/providers/i18n-provider'
import { queryClient } from '@/providers/query-provider'

export interface CreateInvitationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CreateInvitationFormSchema = z.object({
  expiresAt: z.string(),
})

const createInvitationFormDefaultValues = {
  expiresAt: '',
}

export function CreateInvitationDialog({ open, onOpenChange }: CreateInvitationDialogProps) {
  const { t } = useI18n()

  const { communitySlug } = useParams({ from: '/(root)/_communities/$communitySlug/_community' })

  const communityQuery = useSuspenseQuery(getCommunitiesIdOptions({
    path: {
      id: communitySlug,
    },
  }))

  const createInvitationMutation = useMutation({
    ...postCommunitiesIdInvitationsMutation(),
    onSuccess: ({ invitation }) => {
      toast.success(t('toast.invitation-created', { token: invitation.token }))
    },
  })

  const createInvitationForm = useForm({
    defaultValues: createInvitationFormDefaultValues,
    validators: {
      onChange: CreateInvitationFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await createInvitationMutation.mutateAsync({
        path: {
          id: communityQuery.data.community.id,
        },
        body: {
          expiresAt: toDate(value.expiresAt).toISOString(),
        },
      })

      await queryClient.invalidateQueries({
        queryKey: getCommunitiesIdQueryKey({
          path: {
            id: communitySlug,
          },
        }),
      })

      formApi.reset()
    },
  })

  return (
    <Dialog
      modal
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Typography variant="heading">
              <I18nText id="dialog.create-invitation.title" />
            </Typography>
          </DialogTitle>
        </DialogHeader>

        <form
          id="create-invitation-form"
          onSubmit={(e) => {
            e.preventDefault()
            createInvitationForm.handleSubmit()
          }}
        >
          <createInvitationForm.AppField name="expiresAt">
            {field => (
              <field.Input
                type="datetime-local"
                label={t('field.invitation-expires-at.label')}
              />
            )}
          </createInvitationForm.AppField>
        </form>

        <DialogFooter
          showCloseButton={true}
          closeButtonChildren={t('button.close')}
        >
          <Button
            form="create-invitation-form"
            type="submit"
            disabled={createInvitationMutation.isPending}
          >
            {createInvitationMutation.isPending && <Spinner />}
            <I18nText id="button.create-invitation" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
