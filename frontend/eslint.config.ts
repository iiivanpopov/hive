import antfu from '@antfu/eslint-config'
import eslintReact from '@eslint-react/eslint-plugin'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'
import path from 'node:path'

import { globalESLintConfig } from '../eslint.config.ts'

export default antfu({
  ...globalESLintConfig,
  formatters: true,
  ignores: ['**/routeTree.gen.ts'],
  rules: {
    ...globalESLintConfig.rules,
  },
  basePath: path.resolve(__dirname),
}).append(
  eslintReact.configs['recommended-typescript'],
  {
    rules: {
      '@eslint-react/component-hook-factories': 'off',
      '@eslint-react/exhaustive-deps': 'off',
      '@eslint-react/no-array-index-key': 'off',
      '@eslint-react/refs': 'off',
    },
  },
  eslintPluginBetterTailwindcss.configs.recommended,
  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/styles/global.css',
      },
    },
    rules: {
      'better-tailwindcss/no-unknown-classes': 'off',
    },
  },
)
