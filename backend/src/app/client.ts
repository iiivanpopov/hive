import type { App } from './entrypoint'
import { hc } from 'hono/client'

export const client = hc<App>(`http://localhost:5656`, {
  init: {
    credentials: 'include',
  },
})
