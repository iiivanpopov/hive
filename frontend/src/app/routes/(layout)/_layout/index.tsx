import { createFileRoute } from '@tanstack/react-router'

import { I18nText } from '@/components/i18n'
import { Typography } from '@/components/ui/typography.tsx'

export const Route = createFileRoute('/(layout)/_layout/')({
  component: CommunitiesPage,
})

function CommunitiesPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <Typography variant="heading">
        <I18nText id="empty.no-community" />
      </Typography>
    </div>
  )
}
