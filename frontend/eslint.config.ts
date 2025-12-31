import antfu from '@antfu/eslint-config'

import { globalESLintConfig } from '../eslint.config.ts'

export default antfu({
  ...globalESLintConfig,
  react: true,
  ignores: ['**/routeTree.gen.ts'],
  rules: {
    ...globalESLintConfig.rules,
    'react-refresh/only-export-components': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
})
