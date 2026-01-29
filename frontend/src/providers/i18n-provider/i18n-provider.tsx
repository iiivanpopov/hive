import type { Dispatch, ReactNode, SetStateAction } from 'react'

import { useCallback, useMemo, useState } from 'react'
import { IntlProvider } from 'react-intl'

import { LOCAL_STORAGE } from '@/constants/local-storage.ts'
import { loadLocale } from '@/utils/load-locale.ts'

import type { Locale } from './i18n-context.ts'

import { I18nContext } from './i18n-context.ts'

export interface I18nProviderProps {
  initialLocale: Locale
  initialMessages: Record<string, string>
  children: ReactNode
}

export function I18nProvider({ initialLocale, initialMessages, children }: I18nProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const [messages, setMessages] = useState<Record<string, string>>(initialMessages)

  const setLocalePatched: Dispatch<SetStateAction<Locale>> = useCallback(async (newLocale) => {
    const nextLocale
      = typeof newLocale === 'function'
        ? newLocale(locale)
        : newLocale
    const nextMessages = await loadLocale(nextLocale)

    setMessages(nextMessages)
    setLocale(nextLocale)

    localStorage.setItem(LOCAL_STORAGE.locale, nextLocale)
  }, [locale])

  const contextValue = useMemo(() => ({
    locale,
    setLocale: setLocalePatched,
  }), [locale, setLocalePatched])

  return (
    <I18nContext value={contextValue}>
      <IntlProvider messages={messages} locale={locale} defaultLocale={initialLocale}>
        {children}
      </IntlProvider>
    </I18nContext>
  )
}
