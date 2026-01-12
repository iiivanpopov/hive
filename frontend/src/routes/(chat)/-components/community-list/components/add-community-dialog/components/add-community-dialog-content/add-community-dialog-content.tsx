import { Button } from '@/components/ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { I18nText } from '@/routes/-contexts/i18n/components/i18n-text'

import { useAddCommunityDialog } from '../../../../contexts/add-community-dialog-context'

export function AddCommunityDialogContent() {
  const addCommunityDialog = useAddCommunityDialog()

  return (
    <>
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
          onClick={() => addCommunityDialog.setScreen('create')}
        >
          <I18nText id="button.create" />
        </Button>
        <Button
          className="w-1/2"
          onClick={() => addCommunityDialog.setScreen('join')}
        >
          <I18nText id="button.join" />
        </Button>
      </DialogFooter>
    </>
  )
}
