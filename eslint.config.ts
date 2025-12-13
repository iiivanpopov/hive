import antfu from '@antfu/eslint-config'

export const globalESLintConfig: Parameters<typeof antfu>[0] = {
  typescript: true,
  stylistic: true,
  imports: true,
  rules: {
    'antfu/no-top-level-await': 'off',
  },
}

export default antfu(globalESLintConfig)
