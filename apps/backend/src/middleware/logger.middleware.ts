import { logger } from 'hono/logger'
import { pino } from '@/lib/pino'

export function loggerMiddleware() {
  return logger(pino.info.bind(pino))
}
