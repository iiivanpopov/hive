import type { App } from 'hive-backend'
import { hc } from 'hono/client'

export const client = hc<App>(import.meta.env.VITE_BACKEND_URL, {
  init: {
    credentials: 'include',
  },
})
