import { I18nText } from '@/components/i18n/i18n-text'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Typography } from '@/components/ui/typography'

export interface AddCommunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  openCreateCommunityDialog: () => void
  openJoinCommunityDialog: () => void
}

export function AddCommunityDialog({ open, onOpenChange, openCreateCommunityDialog, openJoinCommunityDialog }: AddCommunityDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Typography variant="heading">
              <I18nText id="dialog.add-community.title" />
            </Typography>
          </DialogTitle>
        </DialogHeader>

        <DialogFooter>
          <Button
            className="flex-1"
            onClick={() => {
              openJoinCommunityDialog()
              onOpenChange(false)
            }}
          >
            <I18nText id="button.join-community" />
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              openCreateCommunityDialog()
              onOpenChange(false)
            }}
          >
            <I18nText id="button.create-community" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
