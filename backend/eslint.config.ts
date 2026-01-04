import antfu from '@antfu/eslint-config'
import path from 'node:path'

import { globalESLintConfig } from '../eslint.config.ts'

export default antfu({
  ...globalESLintConfig,
  rules: {
    ...globalESLintConfig.rules,
    'unicorn/throw-new-error': 'off',
    'no-new': 'off',
  },
  basePath: path.resolve(__dirname),
})
