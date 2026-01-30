import { useAddCommunityDialog } from '@/app/routes/(layout)/-providers/add-community-dialog-provider/use-add-community-dialog'
import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'

export function AddCommunityDialogContent() {
  const { setScreen } = useAddCommunityDialog()

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
          onClick={() => setScreen('create')}
        >
          <I18nText id="button.create" />
        </Button>
        <Button
          className="w-1/2"
          onClick={() => setScreen('join')}
        >
          <I18nText id="button.join" />
        </Button>
      </DialogFooter>
    </>
  )
}
