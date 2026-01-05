import { createFileRoute } from '@tanstack/react-router'

import { I18nText } from '@/components/i18n/i18n-text'
import { Typography } from '@/components/ui/typography'

export const Route = createFileRoute('/(root)/_communities/$communitySlug/_community/')({
  component: RouteComponent,
  head: ({ params }) => ({
    meta: [{ title: `#${params.communitySlug}` }],
  }),
})

function RouteComponent() {
  return (
    <div className="flex-1 flex justify-center items-center">
      <Typography variant="heading" className="text-center">
        <I18nText id="text.no-channel-selected" />
      </Typography>
    </div>
  )
}
