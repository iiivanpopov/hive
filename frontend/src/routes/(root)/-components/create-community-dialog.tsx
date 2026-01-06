import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import z from 'zod'

import { getCommunitiesJoinedQueryKey, postCommunitiesMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { I18nText } from '@/components/i18n/i18n-text'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { useI18n } from '@/providers/i18n-provider'
import { queryClient } from '@/providers/query-provider'

const CreateCommunityFormSchema = z.object({
  name: z
    .string()
    .min(3, 'validation.community-name.min')
    .max(50, 'validation.community-name.max'),
})

export type CreateCommunityFormData = z.infer<typeof CreateCommunityFormSchema>

const createCommunityFormDefaultValues: CreateCommunityFormData = {
  name: '',
}

interface CreateCommunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCommunityDialog({
  open,
  onOpenChange,

}: CreateCommunityDialogProps) {
  const { t } = useI18n()
  const navigate = useNavigate()

  const createCommunityMutation = useMutation({
    ...postCommunitiesMutation(),
    onSuccess: async ({ community }) => {
      toast.success(t('toast.community-created', { name: community.name }))

      await queryClient.invalidateQueries({
        queryKey: getCommunitiesJoinedQueryKey(),
      })

      await navigate({
        to: '/$communitySlug',
        params: { communitySlug: community.slug },
      })
    },
  })

  const createCommunityForm = useForm({
    defaultValues: createCommunityFormDefaultValues,
    validators: {
      onChange: CreateCommunityFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      await createCommunityMutation.mutateAsync({ body: { name: value.name } })

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
              <I18nText id="form.create-community.title" />
            </Typography>
          </DialogTitle>
        </DialogHeader>

        <form
          id="create-community-form"
          onSubmit={(e) => {
            e.preventDefault()
            createCommunityForm.handleSubmit()
          }}
        >
          <FieldSet>
            <FieldLegend className="sr-only">
              <I18nText id="form.create-community.title" />
            </FieldLegend>
            <FieldGroup>
              <createCommunityForm.AppField name="name">
                {field => (
                  <field.Input
                    label={t('field.community-name.label')}
                    error={t(field.state.meta.errors)}
                  />
                )}
              </createCommunityForm.AppField>
            </FieldGroup>
          </FieldSet>
        </form>

        <DialogFooter
          showCloseButton={true}
          closeButtonChildren={t('button.close')}
        >
          <Button
            type="submit"
            form="create-community-form"
            disabled={createCommunityMutation.isPending}
          >
            {createCommunityMutation.isPending && <Spinner />}
            <I18nText id="button.create-community" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
