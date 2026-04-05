import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

import type { ChannelListItem } from '../hooks/use-channels-list'

export interface ChannelDeleteDialogProps {
  channel: ChannelListItem | null
  onOpenChange: (open: boolean) => void
  onDelete: () => Promise<void>
  isPending: boolean
}

export function ChannelDeleteDialog({
  channel,
  onOpenChange,
  onDelete,
  isPending,
}: ChannelDeleteDialogProps) {
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <I18nText id="dialog.delete-channel.title" />
          </DialogTitle>
          <DialogDescription>
            <I18nText id="dialog.delete-channel.description" values={{ channelName: channel?.name ?? '' }} />
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="justify-between!">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <I18nText id="button.cancel" />
          </Button>

          <Button variant="destructive" disabled={isPending || !channel} onClick={onDelete}>
            {isPending && <Spinner className="size-4" />}
            <I18nText id="button.delete-channel" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
