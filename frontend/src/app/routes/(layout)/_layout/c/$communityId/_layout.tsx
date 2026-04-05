import { createFileRoute, Outlet } from '@tanstack/react-router'
import z from 'zod'

import { getCommunitiesCommunityIdChannelsOptions, getCommunitiesCommunityIdOptions } from '@/api/@tanstack/react-query.gen'
import { Separator } from '@/components/ui/separator'
import { queryClient } from '@/lib/query-client'

import { ChannelsList, CommunityHeader } from './-components'
import { CreateInvitationProvider } from './-providers/create-invitation-provider'

const RouteParamsSchema = z.object({
  communityId: z.coerce.number().int().positive(),
})

export const Route = createFileRoute('/(layout)/_layout/c/$communityId/_layout')({
  component: Layout,
  pendingComponent: LayoutPending,
  params: RouteParamsSchema,
  loader: async ({ params: { communityId } }) => {
    const [community] = await Promise.all([
      queryClient.ensureQueryData(getCommunitiesCommunityIdOptions({
        path: { communityId },
      })),
      queryClient.ensureQueryData(getCommunitiesCommunityIdChannelsOptions({
        path: { communityId },
      })),
    ])

    return { communityId, community }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `#${loaderData?.community?.community?.name}` }],
  }),
})

function Layout() {
  return (
    <CreateInvitationProvider>
      <div className="flex h-full">
        <div className="h-full w-48 shrink-0 border-r border-border">
          <CommunityHeader />

          <ChannelsList />
        </div>
        <Outlet />
      </div>
    </CreateInvitationProvider>
  )
}

function LayoutPending() {
  return (
    <div className="flex h-full gap-4">
      <div className="h-full w-48 shrink-0 border-r border-border">
        <div className="p-2">
          <div className="h-9 w-full animate-pulse rounded-md bg-muted/70" />
        </div>

        <Separator />

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between p-3">
            <div className="h-4 w-16 animate-pulse rounded-sm bg-muted/60" />
            <div className="size-6 animate-pulse rounded-sm bg-muted/60" />
          </div>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="px-3"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="h-8 w-full animate-pulse rounded-sm bg-muted/55" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
