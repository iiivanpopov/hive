import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { I18nText } from '@/i18n/components/i18n-text'

import { useCreateCommunityDialog } from './hooks/use-create-community-dialog'

export interface CreateCommunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCommunityDialog({ open, onOpenChange }: CreateCommunityDialogProps) {
  const { i18n, form } = useCreateCommunityDialog({ onOpenChange })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
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
                label={i18n.t('field.community-name.label')}
                error={i18n.t(field.state.meta.errors)}
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
      </DialogContent>
    </Dialog>
  )
}
