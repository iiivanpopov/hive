import type { App } from 'hive-backend'
import { hc } from 'hono/client'

const baseUrl = import.meta.env.DEV
  ? 'http://localhost:5656'
  : ''

export const client = hc<App>(baseUrl, {
  init: {
    credentials: 'include',
  },
})
