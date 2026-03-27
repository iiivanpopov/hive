import { createFileRoute } from '@tanstack/react-router'

import { I18nText } from '@/components/i18n'
import { Typography } from '@/components/ui/typography'

export const Route = createFileRoute('/(layout)/_layout/c/$communityId/_layout/')({
  component: CommunityPage,
})

function CommunityPage() {
  return (
    <div className="flex size-full items-center justify-center">
      <Typography variant="heading">
        <I18nText id="empty.no-channel" />
      </Typography>
    </div>
  )
}
