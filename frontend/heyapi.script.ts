import { createClient } from '@hey-api/openapi-ts'

createClient({
  input: 'http://localhost:5656/openapi',
  output: 'api',
  plugins: ['@tanstack/react-query', 'zod'],
})
