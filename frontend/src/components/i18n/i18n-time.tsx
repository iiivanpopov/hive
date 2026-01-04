import { FormattedTime } from 'react-intl'

export interface I18nTimeProps {
  date: string | number | Date | undefined
}

export function I18nTime({ date }: I18nTimeProps) {
  return <FormattedTime value={date} />
}
