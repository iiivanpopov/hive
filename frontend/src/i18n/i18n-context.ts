import type { Dispatch, SetStateAction } from 'react'

import { createContext } from 'react'

import type { Locale } from './types'

export interface I18nContextState {
  locale: Locale
  setLocale: Dispatch<SetStateAction<Locale>>
}

export const I18nContext = createContext<I18nContextState>(null!)
