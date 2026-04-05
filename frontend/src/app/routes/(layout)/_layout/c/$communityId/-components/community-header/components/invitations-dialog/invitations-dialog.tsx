import { Trash2Icon } from 'lucide-react'

import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

import { useInvitationsDialog } from './hooks/use-invitations-dialog'

interface InvitationsDialogProps {
  onOpenChange: (value: boolean) => void
}

export function InvitationsDialog({ onOpenChange }: InvitationsDialogProps) {
  const { state, queries, mutations, functions } = useInvitationsDialog()

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            <I18nText id="dialog.invitations.title" />
          </DialogTitle>
          <DialogDescription>
            <I18nText
              id="dialog.invitations.description"
              values={{ count: state.invitations.length }}
            />
          </DialogDescription>
        </DialogHeader>

        {queries.invitations.isPending && (
          <div className="flex min-h-48 items-center justify-center">
            <Spinner className="size-5" />
          </div>
        )}

        {!queries.invitations.isPending && !state.invitations.length && (
          <div
            className="
              flex min-h-48 items-center justify-center rounded-xl border
              border-dashed border-border/70 bg-muted/30 px-4 text-center
              text-muted-foreground
            "
          >
            <I18nText id="invitation.empty" />
          </div>
        )}

        {!queries.invitations.isPending && state.invitations.length && (
          <div className="max-h-104 space-y-3 overflow-y-auto pr-1">
            {state.invitations.map((invitation) => {
              const isDeleting = mutations.deleteInvitation.isPending
                && mutations.deleteInvitation.variables?.path.invitationId === invitation.id

              return (
                <div
                  key={invitation.id}
                  className="
                    space-y-4 rounded-xl border border-border/70 bg-muted/20 p-4
                    shadow-xs
                  "
                >
                  <div className="space-y-1.5">
                    <p className="font-medium text-foreground">
                      {invitation.token}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {invitation.expiresAt && (
                        <I18nText
                          id="invitation.expires-at"
                          values={{ date: functions.formatDateTime(invitation.expiresAt) }}
                        />
                      )}
                      {!invitation.expiresAt && <I18nText id="invitation.never-expires" />}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <I18nText
                        id="invitation.created-at"
                        values={{ date: functions.formatDateTime(invitation.createdAt) }}
                      />
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting}
                      onClick={() => functions.deleteInvitation(invitation.id)}
                    >
                      {isDeleting && <Spinner className="size-4" />}
                      {!isDeleting && <Trash2Icon className="size-4" />}
                      <I18nText id="button.revoke" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
