import { createRouter, RouterProvider } from '@tanstack/react-router'

import '@/styles/global.css'
import { createRoot } from 'react-dom/client'
import { toast } from 'sonner'

import type { Locale } from '@/providers/i18n-provider'
import type { Theme } from '@/providers/theme-provider'

import { client } from '@/api/client.gen'
import { Providers } from '@/app/providers'
import { env } from '@/config/env'
import { LOCAL_STORAGE } from '@/constants/local-storage'
import { routeTree } from '@/routeTree.gen'
import { loadLocale } from '@/utils/load-locale'

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

const providers = {
  theme: {
    initialTheme,
  },
  i18n: {
    initialLocale,
    initialMessages,
  },
}

createRoot(document.getElementById('root')!).render(
  <Providers {...providers}>
    <RouterProvider router={router} />
  </Providers>,
)
