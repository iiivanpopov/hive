import type { Locale } from '@/providers/i18n-provider'

export async function loadLocale(locale: Locale) {
  const messages = await import(`@/assets/locales/${locale}.json`)
  return messages.default as Record<string, string>
}
