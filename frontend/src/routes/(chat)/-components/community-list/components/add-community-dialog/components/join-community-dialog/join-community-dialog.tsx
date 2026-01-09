import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { I18nText } from '@/i18n/components/i18n-text'

import { useCreateCommunityDialog } from './hooks/use-join-community-dialog'

export interface JoinCommunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinCommunityDialog({ open, onOpenChange }: JoinCommunityDialogProps) {
  const { i18n, form } = useCreateCommunityDialog({ onOpenChange })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <I18nText id="dialog.join-community.title" />
          </DialogTitle>
        </DialogHeader>
        <form
          id="join-community-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.AppField name="token">
            {field => (
              <field.Input
                label={i18n.t('field.join-token.label')}
                error={i18n.t(field.state.meta.errors)}
              />
            )}
          </form.AppField>
        </form>
        <DialogFooter>
          <Button
            form="join-community-form"
            type="submit"
            disabled={form.state.isSubmitting}
          >
            {form.state.isSubmitting && <Spinner />}
            <I18nText id="button.join-community" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
