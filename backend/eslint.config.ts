import antfu from '@antfu/eslint-config'
import { globalESLintConfig } from '../eslint.config.ts'

export default antfu({
  ...globalESLintConfig,
  ignores: Array.isArray(globalESLintConfig?.ignores)
    ? [...globalESLintConfig!.ignores, './client']
    : ['./client'],
})
