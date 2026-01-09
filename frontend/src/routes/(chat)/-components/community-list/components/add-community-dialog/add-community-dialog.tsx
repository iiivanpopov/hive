import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { I18nText } from '@/i18n/components/i18n-text'

import { CreateCommunityDialog } from './components/create-community-dialog'
import { JoinCommunityDialog } from './components/join-community-dialog'
import { useAddCommunityDialog } from './hooks/use-add-community-dialog'

interface AddCommunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddCommunityDialog({ open, onOpenChange }: AddCommunityDialogProps) {
  const { state, functions } = useAddCommunityDialog()

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <I18nText id="dialog.add-community.title" />
            </DialogTitle>
            <DialogDescription>
              <I18nText id="dialog.add-community.description" />
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              className="w-1/2"
              onClick={() => {
                onOpenChange(false)
                functions.setCreateCommunityDialogOpen(true)
              }}
            >
              <I18nText id="button.create" />
            </Button>
            <Button
              className="w-1/2"
              onClick={() => {
                onOpenChange(false)
                functions.setJoinCommunityDialogOpen(true)
              }}
            >
              <I18nText id="button.join" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateCommunityDialog
        open={state.createCommunityDialogOpen}
        onOpenChange={functions.setCreateCommunityDialogOpen}
      />

      <JoinCommunityDialog
        open={state.joinCommunityDialogOpen}
        onOpenChange={functions.setJoinCommunityDialogOpen}
      />
    </>
  )
}
