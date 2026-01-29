import type { Dispatch, ReactNode, SetStateAction } from 'react'

import { PlusIcon } from 'lucide-react'
import { createContext, useState } from 'react'

import { buttonVariants } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog.tsx'
import { useDisclosure } from '@/hooks/use-disclosure'

import { AddCommunityDialogContent, CreateCommunityDialogContent, JoinCommunityDialog } from './components'

export type AddCommunityDialogScreen = 'add' | 'join' | 'create'
export interface AddCommunityDialogContext {
  screen: AddCommunityDialogScreen
  setScreen: Dispatch<SetStateAction<AddCommunityDialogScreen>>
  dialog: ReturnType<typeof useDisclosure>
}

export const AddCommunityDialogContext = createContext<AddCommunityDialogContext>(null!)

const screens: Record<AddCommunityDialogScreen, ReactNode> = {
  add: <AddCommunityDialogContent />,
  join: <JoinCommunityDialog />,
  create: <CreateCommunityDialogContent />,
}

export function AddCommunityDialog() {
  const [screen, setScreen] = useState<'add' | 'join' | 'create'>('add')
  const dialog = useDisclosure(false, { onOpen: () => setScreen('add') })

  return (
    <Dialog open={dialog.opened} onOpenChange={dialog.toggle}>
      <DialogTrigger className={buttonVariants({ size: 'icon-lg', variant: 'secondary' })}>
        <PlusIcon />
      </DialogTrigger>
      <DialogContent>
        <AddCommunityDialogContext value={{ screen, setScreen, dialog }}>
          {screens[screen]}
        </AddCommunityDialogContext>
      </DialogContent>
    </Dialog>
  )
}
