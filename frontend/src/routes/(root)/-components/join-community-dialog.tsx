import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import z from 'zod'

import { getCommunitiesJoinedQueryKey, postCommunitiesJoinTokenMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { I18nText } from '@/components/i18n/i18n-text'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { useI18n } from '@/providers/i18n-provider'
import { queryClient } from '@/providers/query-provider'

const JoinCommunityFormSchema = z.object({
  token: z
    .string()
    .length(16, 'validation.join-token.min'),
})

export type JoinCommunityFormData = z.infer<typeof JoinCommunityFormSchema>

const joinCommunityFormDefaultValues: JoinCommunityFormData = {
  token: '',
}

interface JoinCommunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinCommunityDialog({
  open,
  onOpenChange,
}: JoinCommunityDialogProps) {
  const { t } = useI18n()
  const navigate = useNavigate()

  const joinCommunityMutation = useMutation({
    ...postCommunitiesJoinTokenMutation(),
    onSuccess: async ({ community }) => {
      toast.success(t('toast.community-joined', { name: community.name }))

      await queryClient.invalidateQueries({
        queryKey: getCommunitiesJoinedQueryKey(),
      })

      await navigate({
        to: '/$communitySlug',
        params: { communitySlug: community.slug },
      })
    },
  })

  const joinCommunityForm = useForm({
    defaultValues: joinCommunityFormDefaultValues,
    validators: {
      onChange: JoinCommunityFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await joinCommunityMutation.mutateAsync({ path: { token: value.token } })

      formApi.reset()
      onOpenChange(false)
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
            <Typography variant="subheading">
              <I18nText id="dialog.join-community.title" />
            </Typography>
          </DialogTitle>
        </DialogHeader>

        <form
          id="join-community-form"
          onSubmit={(e) => {
            e.preventDefault()
            joinCommunityForm.handleSubmit()
          }}
        >
          <FieldSet>
            <FieldLegend className="sr-only">
              <I18nText id="form.create-community.title" />
            </FieldLegend>
            <FieldGroup>
              <joinCommunityForm.AppField name="token">
                {field => (
                  <field.Input
                    label={t('field.join-token.label')}
                    error={t(field.state.meta.errors)}
                  />
                )}
              </joinCommunityForm.AppField>
            </FieldGroup>
          </FieldSet>
        </form>

        <DialogFooter
          showCloseButton={true}
          closeButtonChildren={t('button.close')}
        >
          <Button
            type="submit"
            form="join-community-form"
            disabled={joinCommunityMutation.isPending}
          >
            {joinCommunityMutation.isPending && <Spinner />}
            <I18nText id="button.join-community" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
