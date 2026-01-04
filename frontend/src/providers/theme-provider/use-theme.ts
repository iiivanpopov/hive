import { use } from 'react'

import { ThemeContext } from './theme-context'

export function useTheme() {
  const context = use(ThemeContext)

  const toggle = () => context.setTheme(current => current === 'dark' ? 'light' : 'dark')

  return { value: context.theme, set: context.setTheme, toggle }
}
