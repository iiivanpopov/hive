export interface ApiError {
  code: number
  message: string
  details?: unknown
}

export interface ApiResponse<T> {
  data: T
}
