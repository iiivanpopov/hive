import type { Dispatch, ReactNode, SetStateAction } from 'react'

import { useState } from 'react'
import { IntlProvider } from 'react-intl'

import type { AsyncFunction } from '@/types'

import { LOCAL_STORAGE } from '@/lib/constants'
import { fetchLocale } from '@/lib/utils'

import type { Locale } from './i18n-context'

import { I18nContext } from './i18n-context'

export interface I18nProviderProps {
  initialLocale: Locale
  initialMessages: Record<string, string>
  children: ReactNode
}

export function I18nProvider({ initialLocale, initialMessages, children }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const [messages, setMessages] = useState<Record<string, string>>(initialMessages)

  const setLocalePatched: AsyncFunction<Dispatch<SetStateAction<Locale>>> = async (newLocale) => {
    const nextLocale = typeof newLocale === 'function' ? newLocale(locale) : newLocale
    localStorage.setItem(LOCAL_STORAGE.locale, nextLocale)
    const messages = await fetchLocale(nextLocale)
    setMessages(messages)
    setLocale(nextLocale)
  }

  return (
    <I18nContext value={{ locale, setLocale: setLocalePatched }}>
      <IntlProvider messages={messages} locale={locale} defaultLocale={initialLocale}>
        {children}
      </IntlProvider>
    </I18nContext>
  )
}
