import { createRouter, RouterProvider } from '@tanstack/react-router'

import '@/styles/global.css'
import { createRoot } from 'react-dom/client'
import { toast } from 'sonner'

import type { Locale } from '@/routes/-contexts/i18n/types'
import type { Theme } from '@/routes/-contexts/theme'

import { client } from '@/api/client.gen'
import { Toaster } from '@/components/ui/sonner'
import { env } from '@/routes/-config/env'
import { I18nProvider } from '@/routes/-contexts/i18n'
import { QueryProvider } from '@/routes/-contexts/query'
import { ThemeProvider } from '@/routes/-contexts/theme'
import { routeTree } from '@/routeTree.gen'

import { LOCAL_STORAGE } from './routes/-constants/local-storage'
import { loadLocale } from './routes/-contexts/i18n/utils/load-locale'

client.setConfig({
  baseUrl: env.apiUrl,
  credentials: 'include',
})

client.interceptors.response.use(async (response, _, options) => {
  let body = null

  try {
    body = await response.clone().json()
  }
  catch { }

  if (!response.ok && options.meta?.toast !== false)
    toast.error(body.error?.message ?? 'Something went wrong')

  return response
})

const router = createRouter({
  routeTree,
  context: {
    user: null,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const initialTheme = localStorage.getItem(LOCAL_STORAGE.theme) as Theme ?? 'light'
document.documentElement.classList.add(initialTheme)

const initialLocale = localStorage.getItem(LOCAL_STORAGE.locale) as Locale ?? 'en-US'
document.documentElement.setAttribute('lang', initialLocale)

const initialMessages = await loadLocale(initialLocale)

createRoot(document.getElementById('root')!).render(
  <QueryProvider>
    <ThemeProvider initialTheme={initialTheme}>
      <I18nProvider initialLocale={initialLocale} initialMessages={initialMessages}>
        <RouterProvider router={router} />
        <Toaster />
      </I18nProvider>
    </ThemeProvider>
  </QueryProvider>,
)
