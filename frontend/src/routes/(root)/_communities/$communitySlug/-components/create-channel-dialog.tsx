import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import z from 'zod'

import { getCommunitiesIdOptions, getCommunitiesIdQueryKey, postCommunitiesIdChannelsMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { I18nText } from '@/components/i18n/i18n-text'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { useI18n } from '@/providers/i18n-provider'
import { queryClient } from '@/providers/query-provider'

interface CreateChannelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CreateChannelFormSchema = z.object({
  name: z
    .string()
    .min(3, 'validation.channel-name.min')
    .max(20, 'validation.channel-name.max'),
  description: z
    .string()
    .max(255, 'validation.channel-description.max'),
})

const createChannelFormDefaultValues = {
  name: '',
  description: '',
}

export function CreateChannelDialog({ open, onOpenChange }: CreateChannelDialogProps) {
  const { communitySlug } = useParams({ from: '/(root)/_communities/$communitySlug/_community' })
  const { t } = useI18n()

  const communityQuery = useSuspenseQuery(getCommunitiesIdOptions({
    path: {
      id: communitySlug,
    },
  }))

  const createChannelMutation = useMutation({
    ...postCommunitiesIdChannelsMutation(),
    onSuccess: async ({ channel }) => {
      toast.success(t('toast.channel-created', { name: channel.name }))
    },
  })

  const createChannelForm = useForm({
    defaultValues: createChannelFormDefaultValues,
    validators: {
      onChange: CreateChannelFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await createChannelMutation.mutateAsync({
        body: {
          name: value.name,
          description: value.description,
          type: 'text', // currently unavailable
        },
        path: {
          id: communityQuery.data.community.id,
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
      onOpenChange(false)
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Typography variant="heading">
              <I18nText id="dialog.create-channel.title" />
            </Typography>
          </DialogTitle>
        </DialogHeader>

        <form
          id="create-channel"
          onSubmit={(e) => {
            e.preventDefault()
            createChannelForm.handleSubmit()
          }}
        >
          <FieldSet>
            <FieldLegend className="sr-only">
              <I18nText id="form.create-channel.title" />
            </FieldLegend>
            <FieldGroup>
              <createChannelForm.AppField name="name">
                {field => (
                  <field.Input
                    label={t('field.channel-name.label')}
                    error={t(field.state.meta.errors)}
                  />
                )}
              </createChannelForm.AppField>

              <createChannelForm.AppField name="description">
                {field => (
                  <field.Input
                    description={t('field.channel-description.description')}
                    label={t('field.channel-description.label')}
                    error={t(field.state.meta.errors)}
                  />
                )}
              </createChannelForm.AppField>
            </FieldGroup>
          </FieldSet>
        </form>

        <DialogFooter
          showCloseButton={true}
          closeButtonChildren={t('button.close')}
        >
          <Button
            type="submit"
            form="create-channel"
            disabled={createChannelMutation.isPending}
          >
            {createChannelMutation.isPending && <Spinner />}
            <I18nText id="button.create-channel" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
