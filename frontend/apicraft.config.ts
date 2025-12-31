import { apicraft } from '@siberiacancode/apicraft'

export default apicraft([
  {
    input: 'http://localhost:5656/openapi',
    output: 'generated/api',
    instance: {
      name: 'fetches',
      runtimeInstancePath: '@/lib/api',
    },
    nameBy: 'path',
    groupBy: 'tag',
  },
])
