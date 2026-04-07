import { CheckIcon, CopyIcon } from 'lucide-react'

import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'

import { useViewInvitationScreen } from './hooks/use-view-invitation-screen'

export function ViewInvitationScreen() {
  const { state, functions } = useViewInvitationScreen()

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          <I18nText id="dialog.view-invitation.title" />
        </DialogTitle>
        <DialogDescription>
          <I18nText id="invitation.ready" />
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="
          flex flex-col gap-2
          sm:flex-row
        "
        >
          <Input
            value={state.invitationUrl}
            readOnly
            className="flex-1 font-mono text-xs"
          />
          <Button
            type="button"
            variant="outline"
            onClick={functions.onCopy}
          >
            {state.copied && <CheckIcon className="size-4" />}
            {!state.copied && <CopyIcon className="size-4" />}
            <I18nText id="button.copy-link" />
          </Button>
        </div>

        <Typography
          variant="caption"
          className="break-all text-muted-foreground"
        >
          <I18nText id="invitation.token.label" />
          {': '}
          <span className="font-mono text-foreground">
            {state.invitationToken}
          </span>
        </Typography>
      </div>
    </>
  )
}
