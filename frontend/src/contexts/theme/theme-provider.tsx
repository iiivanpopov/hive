import type { Dispatch, ReactNode, SetStateAction } from 'react'

import { useCallback, useMemo, useState } from 'react'

import { LOCAL_STORAGE } from '@/constants/local-storage'

import type { Theme } from './theme-context'

import { ThemeContext } from './theme-context'

interface ThemeProviderProps {
  initialTheme: Theme
  children: ReactNode
}

export function ThemeProvider({ initialTheme, children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  const setThemePatched: Dispatch<SetStateAction<Theme>> = useCallback(
    (newTheme) => {
      const nextTheme = typeof newTheme === 'function'
        ? newTheme(theme)
        : newTheme

      setTheme(nextTheme)

      document.documentElement.classList.remove('dark', 'light')
      document.documentElement.classList.add(nextTheme)
      localStorage.setItem(LOCAL_STORAGE.theme, nextTheme)
    },
    [theme],
  )

  const contextValue = useMemo(() => ({
    theme,
    setTheme: setThemePatched,
  }), [theme, setThemePatched])

  return <ThemeContext value={contextValue}>{children}</ThemeContext>
}
