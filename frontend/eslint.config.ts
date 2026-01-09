import antfu from '@antfu/eslint-config'
import path from 'node:path'

import { globalESLintConfig } from '../eslint.config.ts'

export default antfu({
  ...globalESLintConfig,
  react: true,
  formatters: true,
  ignores: ['**/routeTree.gen.ts'],
  rules: {
    ...globalESLintConfig.rules,
    'react-refresh/only-export-components': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/no-array-index-key': 'off',
    'react-hooks/refs': 'off',
  },
  basePath: path.resolve(__dirname),
})
