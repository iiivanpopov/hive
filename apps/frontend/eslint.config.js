import { antfu } from '@antfu/eslint-config'
import globalConfig from '../../eslint.config'

export default antfu({ react: true }).prepend(globalConfig)
