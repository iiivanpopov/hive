import { use } from 'react'

import { ThemeContext } from './theme-context'

export function useTheme() {
  const { theme, setTheme } = use(ThemeContext)

  const toggle = () => setTheme(current => current === 'dark' ? 'light' : 'dark')

  return { value: theme, set: setTheme, toggle }
}
