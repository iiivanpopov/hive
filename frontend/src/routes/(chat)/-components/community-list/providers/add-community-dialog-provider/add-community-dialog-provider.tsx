import type { ReactNode } from 'react'

import { useState } from 'react'

import { AddCommunityDialogContext } from './add-community-dialog-context'

export interface AddCommunityDialogProviderProps {
  children: ReactNode
}

export function AddCommunityDialogProvider({ children }: AddCommunityDialogProviderProps) {
  const [screen, setScreen] = useState<'add' | 'create' | 'join'>('add')

  return (
    <AddCommunityDialogContext value={{ screen, setScreen }}>
      {children}
    </AddCommunityDialogContext>
  )
}
