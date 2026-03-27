import type { ReactNode } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'

import type { I18nProviderProps } from '@/providers/i18n-provider'
import type { ThemeProviderProps } from '@/providers/theme-provider'

import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/query-client.ts'
import { I18nProvider } from '@/providers/i18n-provider'
import { ThemeProvider } from '@/providers/theme-provider'

export interface ProviderProps {
  theme: Omit<ThemeProviderProps, 'children'>
  i18n: Omit<I18nProviderProps, 'children'>
  children: ReactNode
}

export function Provider({ theme, i18n, children }: ProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider {...theme}>
        <I18nProvider {...i18n}>
          {children}
          <Toaster />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
