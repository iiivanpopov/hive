import { createFileRoute } from '@tanstack/react-router'

import { Typography } from '@/components/ui/typography'
import { I18nText } from '@/i18n/components/i18n-text'

export const Route = createFileRoute('/(chat)/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex-1 flex justify-center items-center">
      <Typography variant="heading" className="text-center">
        <I18nText id="text.no-community-selected" />
      </Typography>
    </div>
  )
}
