import type { ErrorHandler } from 'hono'

import { HTTPException } from 'hono/http-exception'

import { ApiException } from '@/lib/api-exception'
import { pino } from '@/lib/pino'

export function errorMiddleware(): ErrorHandler {
  return (err, c) => {
    if (err instanceof ApiException) {
      return c.json({
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
      }, err.status)
    }

    if (err instanceof HTTPException) {
      return c.json({
        error: {
          code: 'HTTP_ERROR',
          message: err.message,
        },
      }, err.status)
    }

    pino.error(err)

    return c.json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal Server Error',
      },
    }, 500)
  }
}
