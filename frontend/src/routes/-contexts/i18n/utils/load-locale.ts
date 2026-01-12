import type { Locale } from '../types'

export async function loadLocale(locale: Locale) {
  const messages = await import(`@/routes/-contexts/i18n/locales/${locale}.json`)
  return messages.default as Record<string, string>
}
