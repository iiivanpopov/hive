import { antfu } from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  imports: true,
  stylistic: true,
  formatters: true,
  gitignore: true,
})
