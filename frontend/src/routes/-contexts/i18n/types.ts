import type locales from './locales/en-US.json'

export type Locale = 'en-US' | 'uk-UA' | 'ru-RU'
export type I18nKey = keyof typeof locales
