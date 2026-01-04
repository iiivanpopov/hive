import { createRouter, RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'

import '@/styles/global.css'
import { toast } from 'sonner'

import type { Locale } from '@/providers/i18n-provider'
import type { Theme } from '@/providers/theme-provider'

import { client } from '@/api/client.gen'
import { Toaster } from '@/components/ui/sonner'
import { LOCAL_STORAGE } from '@/lib/constants'
import { fetchLocale } from '@/lib/utils'
import { I18nProvider } from '@/providers/i18n-provider'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { routeTree } from '@/routeTree.gen'

client.setConfig({
  baseUrl: import.meta.env.VITE_BACKEND_URL,
  credentials: 'include',
})

client.interceptors.response.use(async (response, _, options) => {
  let body = null

  try {
    body = await response.clone().json()
  }
  catch {
    return response
  }

  if (!response.ok) {
    if (options.meta?.toast !== false)
      toast.error(body.error.message)
  }

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

const initialTheme: Theme = localStorage.getItem(LOCAL_STORAGE.theme) as Theme ?? 'light'
document.documentElement.classList.add(initialTheme)

const initialLocale: Locale = localStorage.getItem(LOCAL_STORAGE.locale) as Locale ?? 'en-US'
document.documentElement.setAttribute('lang', initialLocale)
const initialMessages = await fetchLocale(initialLocale)

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
