import { antfu } from '@antfu/eslint-config'
import globalConfig from '../../eslint.config.js'

export default antfu({
  react: true,
  ignores: ['**/routeTree.gen.ts'],
}).prepend(globalConfig.append())
