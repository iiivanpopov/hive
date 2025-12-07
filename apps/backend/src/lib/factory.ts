import { createFactory } from 'hono/factory'

interface Env {
  Bindings: undefined
  Variables: undefined
}

export const factory = createFactory<Env>()
