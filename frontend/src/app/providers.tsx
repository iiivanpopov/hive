import type { ReactNode } from 'react'

import { Toaster } from 'sonner'

import type { I18nProviderProps } from '@/providers/i18n-provider'
import type { ThemeProviderProps } from '@/providers/theme-provider'

import { I18nProvider } from '@/providers/i18n-provider'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'

export interface ProvidersProps {
  theme: Omit<ThemeProviderProps, 'children'>
  i18n: Omit<I18nProviderProps, 'children'>
  children: ReactNode
}

export function Providers({ theme, i18n, children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider {...theme}>
        <I18nProvider {...i18n}>
          {children}
          <Toaster />
        </I18nProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
