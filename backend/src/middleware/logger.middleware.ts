import type { MiddlewareHandler } from 'hono'

import { logger } from 'hono/logger'

import { pino } from '@/lib/pino'

export function loggerMiddleware(): MiddlewareHandler {
  return logger(pino.info.bind(pino))
}
