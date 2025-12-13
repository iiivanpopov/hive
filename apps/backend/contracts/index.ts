import type app from '@/app/entrypoint'
import { hc } from 'hono/client'
import { serverConfig } from '@/config/server.config'

export interface ApiError {
  code: number
  message: string
  details?: unknown
}

export interface ApiResponse<T> {
  data: T
}

// localhost as host because we will reverse proxy from frontend to backend
export const client = hc<typeof app>(`http://localhost:${serverConfig.port}/api`)
