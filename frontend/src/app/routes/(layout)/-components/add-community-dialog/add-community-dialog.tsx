import type { ReactNode } from 'react'

import { PlusIcon } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog.tsx'

import type { AddCommunityDialogScreen } from '../../-providers/add-community-dialog-provider/add-community-dialog-context.ts'

import { useAddCommunityDialog } from '../../-providers/add-community-dialog-provider'
import { AddCommunityDialogContent, CreateCommunityDialogContent, JoinCommunityDialog } from './components/index.ts'

const screens: Record<AddCommunityDialogScreen, ReactNode> = {
  add: <AddCommunityDialogContent />,
  join: <JoinCommunityDialog />,
  create: <CreateCommunityDialogContent />,
}

export function AddCommunityDialog() {
  const { dialog, screen } = useAddCommunityDialog()

  return (
    <Dialog open={dialog.opened} onOpenChange={dialog.toggle}>
      <DialogTrigger className={buttonVariants({ size: 'icon-lg', variant: 'secondary' })}>
        <PlusIcon />
      </DialogTrigger>
      <DialogContent>
        {screens[screen]}
      </DialogContent>
    </Dialog>
  )
}
