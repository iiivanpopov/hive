import { createFileRoute } from '@tanstack/react-router'

import { getCommunitiesCommunityIdOptions } from '@/api/@tanstack/react-query.gen'
import { I18nText } from '@/components/i18n'
import { Typography } from '@/components/ui/typography'
import { queryClient } from '@/lib/query-client.ts'

export const Route = createFileRoute('/(layout)/_layout/c/$communityId/')({
  component: CommunityPage,
  head: ({ loaderData }) => ({
    meta: [{ title: `#${(loaderData as any)?.community?.name}` }],
  }),
  loader: ({ params }) => queryClient.ensureQueryData(getCommunitiesCommunityIdOptions({
    path: { communityId: +params.communityId },
  })),
})

function CommunityPage() {
  return (
    <div className="h-full flex justify-center items-center">
      <Typography variant="heading">
        <I18nText id="text.no-channel-selected" />
      </Typography>
    </div>
  )
}
