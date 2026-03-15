import { createClient } from '@hey-api/openapi-ts'

createClient({
  input: `http://localhost:${Bun.env.VITE_API_PORT}/openapi`,
  output: 'api',
  plugins: ['@tanstack/react-query'],
})
