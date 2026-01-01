import type { factory } from './factory'

export interface BaseRouter {
  basePath: string
  init: () => ReturnType<typeof factory.createApp>
}
