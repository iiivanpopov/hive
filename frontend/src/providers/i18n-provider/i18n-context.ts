import type { Dispatch, SetStateAction } from 'react'

import { createContext } from 'react'

import type { AsyncFunction } from '@/types'

import type locales from '../../../public/locales/en-US.json'

export type Locale = 'en-US' | 'uk-UA' | 'ru-RU'
export type I18nKey = keyof typeof locales
export interface I18nContextState {
  locale: Locale
  setLocale: AsyncFunction<Dispatch<SetStateAction<Locale>>> | Dispatch<SetStateAction<Locale>>
}

export const I18nContext = createContext<I18nContextState>(null!)
