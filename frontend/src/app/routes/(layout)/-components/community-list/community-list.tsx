import { Link } from '@tanstack/react-router'

import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator.tsx'

import { useCommunityList } from './hooks'

export function CommunityList() {
  const { state, refs, queries, features } = useCommunityList()

  if (!queries.communities.data.communities.length)
    return null

  return (
    <div
      ref={refs.container}
      className="relative w-full max-h-[80%]"
    >
      <div className="no-scrollbar overflow-y-auto h-full flex flex-col items-center gap-4">
        {queries.communities.data.communities.map((community, i) => (
          <div
            key={community.id}
            ref={i === 0 ? refs.firstItem : i === queries.communities.data.communities.length - 1 ? refs.lastItem : null}
            className="relative w-20 flex justify-center items-center"
          >
            <Link
              to="/c/$communityId"
              params={{ communityId: String(community.id) }}
              className={buttonVariants({ size: 'icon-lg', variant: 'secondary', class: 'text-2xl!' })}
            >
              {community.name.at(0)!.toUpperCase()}
            </Link>
            <div
              data-active={Number(state.params.communityId) === community.id ? 'true' : undefined}
              className="scale-0 opacity-0 data-active:scale-100 data-active:opacity-100 transition-all absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1.25 rounded-tr-3xl rounded-br-3xl bg-primary"
            />
          </div>
        ))}
      </div>

      <Separator className="mx-auto w-8! mt-4" />

      <div
        data-open={features.scrollTopBadge.opened ? 'true' : undefined}
        className="scale-0 opacity-0 data-open:opacity-100 data-open:scale-100 transition-all duration-200 ease-in-out absolute top-0 left-0 right-0 text-center mx-2 py-0.75 bg-popover border-border border rounded-sm pointer-events-none text-sm"
      >
        more...
      </div>
      <div
        data-open={features.scrollBottomBadge.opened ? 'true' : undefined}
        className="scale-0 opacity-0 data-open:opacity-100 data-open:scale-100 transition-all duration-200 ease-in-out absolute bottom-0 left-0 right-0 text-center mx-2 py-0.75 bg-popover border-border border rounded-sm pointer-events-none text-sm"
      >
        more...
      </div>
    </div>
  )
}
