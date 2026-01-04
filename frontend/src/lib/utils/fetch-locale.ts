import type { Locale } from '@/providers/i18n-provider'

export async function fetchLocale(locale: Locale) {
  const messages = await fetch(`/locales/${locale}.json`)

  if (!messages.ok)
    throw new Error(`Failed to fetch locale: ${locale}`)

  try {
    const data = await messages.json()
    return data as Record<string, string>
  }
  catch {
    return {}
  }
}
