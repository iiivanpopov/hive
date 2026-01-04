import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'

import '@/styles/global.css'
import { client } from '@/api/client.gen'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/query-client'
import { routeTree } from '@/routeTree.gen'

client.setConfig({
  baseUrl: import.meta.env.VITE_BACKEND_URL,
  credentials: 'include',
})

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <Toaster />
  </QueryClientProvider>,
)
