import { Button } from '@/components/ui/button'
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { I18nText } from '@/routes/-contexts/i18n/components/i18n-text'

import { useCreateCommunityDialogContent } from './hooks/use-create-community-dialog-content'

export function CreateCommunityDialogContent() {
  const { features, form } = useCreateCommunityDialogContent()

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          <I18nText id="dialog.create-community.title" />
        </DialogTitle>
      </DialogHeader>
      <form
        id="create-community-form"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.AppField name="name">
          {field => (
            <field.Input
              label={features.i18n.t('field.community-name.label')}
              error={features.i18n.t(field.state.meta.errors)}
            />
          )}
        </form.AppField>
      </form>
      <DialogFooter>
        <Button
          form="create-community-form"
          type="submit"
          disabled={form.state.isSubmitting}
        >
          {form.state.isSubmitting && <Spinner />}
          <I18nText id="button.create-community" />
        </Button>
      </DialogFooter>
    </>
  )
}
