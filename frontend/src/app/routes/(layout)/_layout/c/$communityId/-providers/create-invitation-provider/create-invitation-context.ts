import type { Dispatch, SetStateAction } from 'react'

import { createContext } from 'react'

import type { useDisclosure } from '@/hooks/use-disclosure'

export type CreateInvitationDialogScreen = 'create' | 'view'

export interface CreateInvitationContextState {
  dialog: ReturnType<typeof useDisclosure>
  screen: CreateInvitationDialogScreen
  setScreen: Dispatch<SetStateAction<CreateInvitationDialogScreen>>
  invitation: string | null
  setInvitation: Dispatch<SetStateAction<string | null>>
}

export const CreateInvitationContext = createContext<CreateInvitationContextState>(null!)
