import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { HashIcon } from 'lucide-react'
import { useRef } from 'react'

import { getCommunitiesIdOptions } from '@/api/@tanstack/react-query.gen'
import { useBoolean } from '@/hooks/use-boolean'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'
import { cn } from '@/lib/utils'

export function ChannelList() {
  const { communitySlug, channelSlug } = useParams({ strict: false })
  const navigate = useNavigate()

  const listRef = useRef<HTMLDivElement>(null)
  const [firstChannelInView, setFirstChannelInView] = useBoolean(true)
  const [lastChannelInView, setLastChannelInView] = useBoolean(true)

  const { ref: firstChannelRef } = useIntersectionObserver<HTMLButtonElement>({
    root: listRef,
    threshold: 0.2,
    onChange: entries => setFirstChannelInView(entries.some(e => e.isIntersecting)),
  })

  const { ref: lastChannelRef } = useIntersectionObserver<HTMLButtonElement>({
    root: listRef,
    threshold: 0.2,
    onChange: entries => setLastChannelInView(entries.some(e => e.isIntersecting)),
  })

  const channelsQuery = useSuspenseQuery(
    getCommunitiesIdOptions({
      path: {
        id: communitySlug!,
      },
    }),
  )

  const handleOpenChannel = (channelSlug: string) => navigate({
    to: `/$communitySlug/$channelSlug`,
    params: {
      communitySlug: communitySlug!,
      channelSlug,
    },
  })

  return (
    <div ref={listRef} className="relative">
      <div className="flex flex-col gap-2 h-[90vh] no-scrollbar overflow-y-auto">
        {channelsQuery.data.community.channels.map((channel, i) => {
          const isLast = i === channelsQuery.data.community.channels.length - 1
          const isFirst = i === 0
          const isActive = channelSlug === channel.slug

          return (
            <button
              key={channel.id}
              onClick={() => handleOpenChannel(channel.slug)}
              ref={isFirst ? firstChannelRef : isLast ? lastChannelRef : undefined}
              className={cn(
                'flex gap-2 cursor-pointer hover:bg-zinc-200 transition-colors px-2 mx-2 py-1 rounded-sm items-center max-w-44 w-full',
                isActive && 'bg-zinc-200',
              )}
            >
              <HashIcon size={20} />
              {channel.name}
            </button>
          )
        })}
      </div>

      <div className="pointer-events-none absolute top-0 left-2 right-2">
        <div
          data-open={!firstChannelInView}
          className="w-full text-center mx-auto opacity-0 scale-0 text-sm rounded-sm bg-zinc-200 py-0.5 px-1.5 text-muted-foreground animate-in fade-in zoom-in-0 duration-200 data-open:opacity-100 data-open:scale-100"
        >
          more...
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-2 right-2">
        <div
          data-open={!lastChannelInView}
          className="w-full text-center mx-auto opacity-0 scale-0 text-sm rounded-sm bg-zinc-200 py-0.5 px-1.5 text-muted-foreground animate-in fade-in zoom-in-0 duration-200 data-open:opacity-100 data-open:scale-100"
        >
          more...
        </div>
      </div>
    </div>
  )
}
