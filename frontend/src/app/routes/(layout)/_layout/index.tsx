import { createFileRoute } from '@tanstack/react-router'

import { I18nText } from '@/components/i18n'
import { Typography } from '@/components/ui/typography.tsx'

export const Route = createFileRoute('/(layout)/_layout/')({
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
