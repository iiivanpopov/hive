import antfu from '@antfu/eslint-config'

export const globalESLintConfig: Parameters<typeof antfu>[0] & {
  ignores?: string[]
} = {
  typescript: true,
  stylistic: true,
  imports: true,
  test: true,
  rules: {
    'antfu/no-top-level-await': 'off',
    'node/prefer-global/buffer': 'off',
    'perfectionist/sort-imports': ['error', {
      environment: 'bun',
    }],
    'ts/no-redeclare': 'off',
  },
}

export default antfu(globalESLintConfig)
