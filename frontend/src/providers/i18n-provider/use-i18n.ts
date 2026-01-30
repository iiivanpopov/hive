import { use } from 'react'
import { useIntl } from 'react-intl'

import type locales from '@/assets/locales/en-US.json'

import { I18nContext } from '@/providers/i18n-provider/index.ts'

export type I18nKey = keyof typeof locales

export function useI18n() {
  const { locale, setLocale } = use(I18nContext)
  const intl = useIntl()

  function t(id?: I18nKey, values?: Record<string, string | number>): string
  function t(id?: { message?: string }, values?: Record<string, string | number>): { message?: string } | undefined
  function t(id?: Array<{ message?: string } | undefined>, values?: Record<string, string | number>): { message?: string } | undefined
  function t(id?: I18nKey | { message?: string } | Array<{ message?: string } | undefined>, values?: Record<string, string | number>): any {
    if (id == null)
      return undefined
    if (typeof id === 'string')
      return intl.formatMessage({ id }, values)

    if (Array.isArray(id)) {
      for (const item of id) {
        if (!item)
          continue

        if (typeof item === 'object' && 'message' in item && item.message)
          return { message: intl.formatMessage({ id: item.message }, values) }
      }

      return undefined
    }

    if (typeof id === 'object' && 'message' in id) {
      if (!id.message)
        return undefined

      return { message: intl.formatMessage({ id: id.message }, values) }
    }

    return undefined
  }

  return {
    t,
    locale,
    setLocale,
  }
}
