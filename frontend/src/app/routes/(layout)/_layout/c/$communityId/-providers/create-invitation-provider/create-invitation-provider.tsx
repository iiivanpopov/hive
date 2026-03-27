import type { ReactNode } from 'react'

import { useMemo, useState } from 'react'

import { useDisclosure } from '@/hooks/use-disclosure'

import type { CreateInvitationDialogScreen } from './create-invitation-context'

import { CreateInvitationContext } from './create-invitation-context'

export interface CreateInvitationProviderProps {
  children: ReactNode
}

export function CreateInvitationProvider({ children }: CreateInvitationProviderProps) {
  const [screen, setScreen] = useState<CreateInvitationDialogScreen>('create')
  const [invitation, setInvitation] = useState<string | null>(null)

  const dialog = useDisclosure(false, {
    onOpen: () => {
      setScreen('create')
      setInvitation(null)
    },
  })

  const contextValue = useMemo(() => ({
    dialog,
    screen,
    setScreen,
    invitation,
    setInvitation,
  }), [dialog, screen, invitation])

  return (
    <CreateInvitationContext value={contextValue}>
      {children}
    </CreateInvitationContext>
  )
}
