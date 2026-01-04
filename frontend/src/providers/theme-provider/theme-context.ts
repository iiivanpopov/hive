import type { Dispatch, SetStateAction } from 'react'

import { createContext } from 'react'

export type Theme = 'dark' | 'light'

export interface ThemeContextState {
  theme: Theme
  setTheme: Dispatch<SetStateAction<Theme>>
}

export const ThemeContext = createContext<ThemeContextState>(null!)
