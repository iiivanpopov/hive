import type { Dispatch, ReactNode, SetStateAction } from 'react'

import { useCallback, useState } from 'react'
import { IntlProvider } from 'react-intl'

import { LOCAL_STORAGE } from '@/constants/local-storage'

import type { Locale } from './types'

import { I18nContext } from './i18n-context'
import { loadLocale } from './utils/load-locale'

export interface I18nProviderProps {
  initialLocale: Locale
  initialMessages: Record<string, string>
  children: ReactNode
}

export function I18nProvider({ initialLocale, initialMessages, children }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const [messages, setMessages] = useState<Record<string, string>>(initialMessages)

  const setLocalePatched: Dispatch<SetStateAction<Locale>> = useCallback(async (newLocale) => {
    setLocale((prev) => {
      const nextLocale = typeof newLocale === 'function'
        ? newLocale(prev)
        : newLocale

      localStorage.setItem(LOCAL_STORAGE.locale, nextLocale)

      loadLocale(nextLocale).then(setMessages)

      return nextLocale
    })
  }, [])

  return (
    <I18nContext value={{ locale, setLocale: setLocalePatched }}>
      <IntlProvider messages={messages} locale={locale} defaultLocale={initialLocale}>
        {children}
      </IntlProvider>
    </I18nContext>
  )
}
