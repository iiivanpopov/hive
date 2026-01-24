import type { Locale } from '../types'

export async function loadLocale(locale: Locale) {
  const messages = await import(`@/i18n/locales/${locale}.json`)
  return messages.default as Record<string, string>
}
