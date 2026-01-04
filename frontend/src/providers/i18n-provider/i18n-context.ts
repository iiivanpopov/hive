import type { Dispatch, SetStateAction } from 'react'

import { createContext } from 'react'

import type { AsyncFunction } from '@/types'

export type Locale = 'en-US' | 'uk-UA' | 'ru-RU'

export interface I18nContextState {
  locale: Locale
  setLocale: AsyncFunction<Dispatch<SetStateAction<Locale>>> | Dispatch<SetStateAction<Locale>>
}

export const I18nContext = createContext<I18nContextState>(null!)
