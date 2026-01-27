import { createFileRoute } from '@tanstack/react-router'

import { Typography } from '@/components/ui/typography'
import { I18nText } from '@/i18n/components'

export const Route = createFileRoute('/(app)/_layout/')({
  component: CommunitiesPage,
})

function CommunitiesPage() {
  return (
    <div className="size-full flex justify-center items-center">
      <Typography variant="heading" className="text-center">
        <I18nText id="text.no-community-selected" />
      </Typography>
    </div>
  )
}
