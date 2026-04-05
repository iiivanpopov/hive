import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

import type { ChannelListItem } from '../hooks/use-channels-list'

import { useUpdateChannelDialog } from './hooks/use-update-channel-dialog'

export interface UpdateChannelDialogProps {
  channel: ChannelListItem | null
  onOpenChange: (open: boolean) => void
  onSubmit: (value: { name: string, description: string }) => Promise<void>
  isPending: boolean
}

export function UpdateChannelDialog({
  channel,
  onOpenChange,
  onSubmit,
  isPending,
}: UpdateChannelDialogProps) {
  const { features, form } = useUpdateChannelDialog({ channel, onSubmit })

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {features.i18n.t('dialog.edit-channel.title')}
          </DialogTitle>
          <DialogDescription>
            {features.i18n.t('dialog.edit-channel.description')}
          </DialogDescription>
        </DialogHeader>

        <form
          id="update-channel-form"
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.AppField name="name">
            {field => (
              <field.Input
                label={features.i18n.t('input.channel-name.label')}
                error={features.i18n.t(field.state.meta.errors)}
              />
            )}
          </form.AppField>

          <form.AppField name="description">
            {field => (
              <field.Textarea
                rows={4}
                label={features.i18n.t('input.channel-description.label')}
                error={features.i18n.t(field.state.meta.errors)}
              />
            )}
          </form.AppField>
        </form>

        <DialogFooter className="justify-between!">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {features.i18n.t('button.cancel')}
          </Button>

          <Button form="update-channel-form" type="submit" disabled={isPending}>
            {isPending && <Spinner className="size-4" />}
            {features.i18n.t('button.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
