import type { MiddlewareHandler, ValidationTargets } from 'hono/types'
import type { ZodType } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { ApiException } from '@/lib/api-exception'

export function validatorMiddleware(target: keyof ValidationTargets, schema: ZodType): MiddlewareHandler {
  return zValidator(target, schema, (result) => {
    if (!result.success) {
      if (result.error.issues.length === 0) {
        throw ApiException.BadRequest('Validation Error', 'INVALID_INPUT')
      }

      throw ApiException.BadRequest('Validation Error', 'INVALID_INPUT', result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      })))
    }
  })
}

export const v = validatorMiddleware
