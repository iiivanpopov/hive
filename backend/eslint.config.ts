import antfu from '@antfu/eslint-config'

import { globalESLintConfig } from '../eslint.config.ts'

export default antfu({
  ...globalESLintConfig,
  rules: {
    ...globalESLintConfig.rules,
    'unicorn/throw-new-error': 'off',
    'no-new': 'off',
  },
})
