import type { ReactNode } from 'react'

import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

import { buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog.tsx'
import { useDisclosure } from '@/hooks/use-disclosure'

import type { AddCommunityDialogScreen } from './add-community-dialog-context.ts'

import { AddCommunityDialogContext } from './add-community-dialog-context.ts'
import { AddCommunityDialogContent, CreateCommunityDialogContent, JoinCommunityDialog } from './components'

const screens: Record<AddCommunityDialogScreen, ReactNode> = {
  add: <AddCommunityDialogContent />,
  join: <JoinCommunityDialog />,
  create: <CreateCommunityDialogContent />,
}

export function AddCommunityDialog() {
  const [screen, setScreen] = useState<'add' | 'join' | 'create'>('add')
  const dialog = useDisclosure(false, { onOpen: () => setScreen('add') })

  return (
    <AddCommunityDialogContext value={{ screen, setScreen, dialog }}>
      <Dialog open={dialog.opened} onOpenChange={dialog.toggle}>
        <DialogTrigger className={buttonVariants({ size: 'icon-lg', variant: 'secondary' })}>
          <PlusIcon />
        </DialogTrigger>
        <DialogContent>
          {screens[screen]}
        </DialogContent>
      </Dialog>
    </AddCommunityDialogContext>
  )
}
