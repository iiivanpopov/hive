import { createFileRoute } from '@tanstack/react-router'

import { getCommunitiesCommunityIdOptions } from '@/api/@tanstack/react-query.gen'
import { queryClient } from '@/providers/query-provider'

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
  return <div>Hello "/(chat)/_layout/$communityId/"!</div>
}
