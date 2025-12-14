import { createFactory } from 'hono/factory'

export interface Env {
  Bindings: undefined
  Variables: undefined
}

export const factory = createFactory<Env>()
