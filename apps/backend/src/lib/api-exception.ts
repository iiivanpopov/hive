import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { HTTPException } from 'hono/http-exception'

export class ApiException extends HTTPException {
  public code?: string
  public details?: unknown

  constructor(status: ContentfulStatusCode = 500, message = 'Internal Server Error', code?: string, details?: unknown) {
    super(status, { message })
    this.code = code
    this.details = details
  }

  static BadRequest(message = 'Bad Request', code?: string, details?: unknown) {
    return new ApiException(400, message, code, details)
  }

  static Unauthorized(message = 'Unauthorized', code?: string, details?: unknown) {
    return new ApiException(401, message, code, details)
  }

  static Forbidden(message = 'Forbidden', code?: string, details?: unknown) {
    return new ApiException(403, message, code, details)
  }

  static NotFound(message = 'Not Found', code?: string, details?: unknown) {
    return new ApiException(404, message, code, details)
  }

  static InternalServerError(message = 'Internal Server Error', code?: string, details?: unknown) {
    return new ApiException(500, message, code, details)
  }
}
