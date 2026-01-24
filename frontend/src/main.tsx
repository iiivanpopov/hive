import { createRouter, RouterProvider } from '@tanstack/react-router'

import '@/styles/global.css'
import { createRoot } from 'react-dom/client'
import { toast, Toaster } from 'sonner'

import type { Locale } from '@/i18n/types'

import { client } from '@/api/client.gen'
import { env } from '@/config/env'
import { LOCAL_STORAGE } from '@/constants/local-storage'
import { I18nProvider } from '@/i18n/providers/i18n-provider'
import { loadLocale } from '@/i18n/utils'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { routeTree } from '@/routeTree.gen'

client.setConfig({
  baseUrl: env.apiUrl,
  credentials: 'include',
})

client.interceptors.response.use(async (response, _, options) => {
  const body = await response.clone().json().catch()

  if (!response.ok && options.meta?.toast !== false)
    toast.error(body?.error?.message ?? 'Something went wrong')

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
