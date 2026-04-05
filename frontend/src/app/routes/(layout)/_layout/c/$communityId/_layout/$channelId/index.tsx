import { createFileRoute } from '@tanstack/react-router'
import { DotIcon, HashIcon } from 'lucide-react'
import z from 'zod'

import { getChannelsChannelIdOptions } from '@/api/@tanstack/react-query.gen'
import { Typography } from '@/components/ui/typography'
import { queryClient } from '@/lib/query-client'

const RouteParamsSchema = z.object({
  communityId: z.coerce.number().int().positive(),
  channelId: z.coerce.number().int().positive(),
})

export const Route = createFileRoute('/(layout)/_layout/c/$communityId/_layout/$channelId/')({
  component: RouteComponent,
  params: RouteParamsSchema,
  loader: ({ params: { channelId } }) => queryClient.ensureQueryData(getChannelsChannelIdOptions({
    path: { channelId },
  })),
  head: ({ loaderData }) => ({ meta: [{ title: `#${loaderData?.channel?.name}` }] }),
})

function RouteComponent() {
  const { channel } = Route.useLoaderData()

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-14 items-center border-b border-border px-3">
        <div className="flex items-center gap-2">
          <HashIcon className="size-6" />
          <Typography>
            {channel.name}
          </Typography>
        </div>

        {channel.description && (
          <>
            <DotIcon className="text-muted-foreground" />
            <Typography className="max-w-sm truncate" variant="caption">
              {channel.description}
            </Typography>
          </>
        )}
      </div>
    </div>
  )
}
