import type { ReactNode } from 'react'

import { Dialog, DialogContent } from '@/components/ui/dialog'

import { useCreateInvitation } from '../../../../-providers/create-invitation-provider'
import { CreateInvitationScreen, ViewInvitationScreen } from './components'

type InvitationDialogScreen = 'create' | 'view'

const screens: Record<InvitationDialogScreen, ReactNode> = {
  create: <CreateInvitationScreen />,
  view: <ViewInvitationScreen />,
}

export function CreateInvitationDialog() {
  const { dialog, screen } = useCreateInvitation()

  return (
    <Dialog open={dialog.opened} onOpenChange={dialog.toggle}>
      <DialogContent>
        {screens[screen]}
      </DialogContent>
    </Dialog>
  )
}
