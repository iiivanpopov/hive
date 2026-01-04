import type { Dispatch, ReactNode, SetStateAction } from 'react'

import { useState } from 'react'

import { LOCAL_STORAGE } from '@/lib/constants'

import type { Theme } from './theme-context'

import { ThemeContext } from './theme-context'

interface ThemeProviderProps {
  initialTheme: Theme
  children: ReactNode
}

export function ThemeProvider({ initialTheme, children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  const setThemePatched: Dispatch<SetStateAction<Theme>> = newTheme => setTheme((current) => {
    const nextTheme = typeof newTheme === 'function' ? newTheme(current) : newTheme
    document.documentElement.classList.remove(current)
    document.documentElement.classList.add(nextTheme)
    localStorage.setItem(LOCAL_STORAGE.theme, nextTheme)
    return nextTheme
  })

  return <ThemeContext value={{ theme, setTheme: setThemePatched }}>{children}</ThemeContext>
}
