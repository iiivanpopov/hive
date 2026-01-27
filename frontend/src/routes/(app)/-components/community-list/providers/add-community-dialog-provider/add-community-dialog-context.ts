import type { Dispatch, SetStateAction } from 'react'

import { createContext } from 'react'

import type { useDisclosure } from '@/hooks/use-disclosure'

export type AddCommunityDialogScreen = 'add' | 'join' | 'create'

export interface AddCommunityDialogContext {
  screen: AddCommunityDialogScreen
  setScreen: Dispatch<SetStateAction<AddCommunityDialogScreen>>
  dialog: ReturnType<typeof useDisclosure>
}

export const AddCommunityDialogContext = createContext<AddCommunityDialogContext>(null!)
