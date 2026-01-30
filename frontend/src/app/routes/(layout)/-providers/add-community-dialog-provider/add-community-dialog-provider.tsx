import type { ReactNode } from 'react'

import { useMemo, useState } from 'react'

import { useDisclosure } from '@/hooks/use-disclosure'

import type { AddCommunityDialogScreen } from './add-community-dialog-context'

import { AddCommunityDialogContext } from './add-community-dialog-context'

export interface AddCommunityDialogProviderProps {
  children: ReactNode
}

export function AddCommunityDialogProvider({ children }: AddCommunityDialogProviderProps) {
  const [screen, setScreen] = useState<AddCommunityDialogScreen>('add')

  const dialog = useDisclosure(false, { onOpen: () => setScreen('add') })

  const contextValue = useMemo(() => ({
    dialog,
    screen,
    setScreen,
  }), [dialog, screen])

  return (
    <AddCommunityDialogContext value={contextValue}>
      {children}
    </AddCommunityDialogContext>
  )
}
