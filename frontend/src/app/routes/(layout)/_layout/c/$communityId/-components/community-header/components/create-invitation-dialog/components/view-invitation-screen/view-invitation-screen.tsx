import { CheckIcon, CopyIcon } from 'lucide-react'

import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import { useViewInvitationScreen } from './hooks/use-view-invitation-screen'

export function ViewInvitationScreen() {
  const { state, functions } = useViewInvitationScreen()

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          <I18nText id="dialog.view-invitation.title" />
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={state.invitation ?? ''}
            readOnly
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={functions.onCopy}
          >
            {state.copied ? <CheckIcon /> : <CopyIcon />}
          </Button>
        </div>
      </div>
    </>
  )
}
