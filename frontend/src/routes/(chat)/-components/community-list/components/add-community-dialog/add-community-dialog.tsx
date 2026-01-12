import type { ReactNode } from 'react'

import type { useDisclosure } from '@/hooks/use-disclosure'

import { Dialog, DialogContent } from '@/components/ui/dialog'

import type { AddCommunityDialogScreen } from '../../contexts/add-community-dialog-context'

import { useAddCommunityDialog } from '../../contexts/add-community-dialog-context'
import { AddCommunityDialogContent } from './components/add-community-dialog-content'
import { CreateCommunityDialogContent } from './components/create-community-dialog-content'
import { JoinCommunityDialog } from './components/join-community-dialog-content'

interface AddCommunityDialogProps {
  addCommunityDialog: ReturnType<typeof useDisclosure>
}

const screens: Record<AddCommunityDialogScreen, ReactNode> = {
  add: <AddCommunityDialogContent />,
  join: <JoinCommunityDialog />,
  create: <CreateCommunityDialogContent />,
}

export function AddCommunityDialog({ addCommunityDialog }: AddCommunityDialogProps) {
  const { screen } = useAddCommunityDialog()

  return (
    <Dialog open onOpenChange={addCommunityDialog.toggle}>
      <DialogContent>
        {screens[screen]}
      </DialogContent>
    </Dialog>
  )
}
