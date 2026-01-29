import { FormattedMessage } from 'react-intl'

import type { I18nKey } from '@/providers/i18n-provider'

export interface I18nTextProps {
  id: I18nKey
  values?: Record<string, any>
}

export function I18nText({ id, values }: I18nTextProps) {
  return <FormattedMessage id={id} values={values} />
}
