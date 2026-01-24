import type { ReactNode } from 'react'

import { useState } from 'react'

import { useDisclosure } from '@/hooks/use-disclosure'

import { AddCommunityDialogContext } from './add-community-dialog-context'

export interface AddCommunityDialogProviderProps {
  children: ReactNode
}

export function AddCommunityDialogProvider({ children }: AddCommunityDialogProviderProps) {
  const [screen, setScreen] = useState<'add' | 'create' | 'join'>('add')
  const dialog = useDisclosure(false, {
    onOpen: () => setScreen('add'),
  })

  return (
    <AddCommunityDialogContext value={{ screen, setScreen, dialog }}>
      {children}
    </AddCommunityDialogContext>
  )
}
