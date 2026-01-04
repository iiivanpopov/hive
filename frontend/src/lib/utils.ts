import type { ClassValue } from 'clsx'

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { Locale } from '@/providers/i18n-provider'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
