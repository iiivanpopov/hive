import type locales from '../../public/locales/en-US.json'

export type AnyFunction = (...args: any[]) => any
export type AsyncFunction<T extends AnyFunction> = (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>

export type I18nKey = keyof typeof locales
