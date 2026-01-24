import type { Dispatch, SetStateAction } from 'react'

import { createContext } from 'react'

export type AddCommunityDialogScreen = 'add' | 'join' | 'create'

export interface AddCommunityDialogContext {
  screen: AddCommunityDialogScreen
  setScreen: Dispatch<SetStateAction<AddCommunityDialogScreen>>
}

export const AddCommunityDialogContext = createContext<AddCommunityDialogContext>(null!)
