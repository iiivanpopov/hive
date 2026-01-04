// eslint-disable-next-line unused-imports/no-unused-imports
import type { RequestOptions } from '@/api/client/types.gen'

declare module '@/api/client/types.gen' {
  interface RequestOptions {
    meta?: {
      toast?: boolean
    }
  }
}
