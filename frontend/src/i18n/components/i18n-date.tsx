import { FormattedDate } from 'react-intl'

export interface I18nDateProps {
  date: string | number | Date | undefined
}

export function I18nDate({ date }: I18nDateProps) {
  return <FormattedDate value={date} />
}
