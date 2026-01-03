import type { Hook } from '@hono/standard-validator'
import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { ValidationTargets } from 'hono'

import { validator } from 'hono-openapi'

import type { Env } from '@/lib/factory'

import { ApiException } from '@/lib/api-exception'
import { pino } from '@/lib/pino'

export function mapValidationErrors(errors: readonly StandardSchemaV1.Issue[]) {
  return errors.map(issue => ({
    field: issue.path?.map(p => typeof p === 'object' ? p.key : p).join('.') ?? '',
    message: issue.message,
  }))
}

export function validatorMiddleware<
  Schema extends StandardSchemaV1,
  Target extends keyof ValidationTargets,
  P extends string = string,
>(target: Target, schema: Schema) {
  const hook: Hook<StandardSchemaV1.InferOutput<Schema>, Env, P, Target> = (result) => {
    if (result.success)
      return

    pino.debug(result)

    if (result.error.length === 0)
      throw ApiException.BadRequest('Validation Error', 'INVALID_INPUT')

    throw ApiException.BadRequest(
      'Validation Error',
      'INVALID_INPUT',
      mapValidationErrors(result.error),
    )
  }

  return validator(target, schema, hook)
}

export { validatorMiddleware as validator }
