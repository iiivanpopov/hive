import { Link } from '@tanstack/react-router'

import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator.tsx'

import { useCommunityList } from './hooks/use-community-list'

export function CommunityList() {
  const { state, refs, queries, features } = useCommunityList()

  if (!queries.communities.data.communities.length)
    return null

  return (
    <div
      ref={refs.container}
      className="relative mt-4 flex max-h-[78%] w-full flex-col gap-4"
    >
      <div className="
        no-scrollbar flex h-full flex-col items-center gap-4 overflow-y-auto
      "
      >
        {queries.communities.data.communities.map((community, i) => (
          <div
            key={community.id}
            ref={i === 0 ? refs.firstItem : i === queries.communities.data.communities.length - 1 ? refs.lastItem : null}
            className="relative flex w-20 items-center justify-center"
          >
            <Link
              to="/c/$communityId"
              params={{ communityId: community.id }}
              className={buttonVariants({ size: 'icon-lg', variant: 'secondary', class: 'text-2xl!' })}
            >
              {community.name.at(0)!.toUpperCase()}
            </Link>
            <div
              data-active={Number(state.params.communityId) === community.id}
              className="
                absolute top-1/2 left-0 h-7 w-1.25 -translate-y-1/2 scale-0
                rounded-r-3xl bg-primary opacity-0 transition-all
                data-[active=true]:scale-100 data-[active=true]:opacity-100
              "
            />
          </div>
        ))}
      </div>

      <Separator className="mx-auto w-8!" />

      <div
        data-open={features.scrollTopBadge.opened}
        className="
          pointer-events-none absolute top-0 right-0 left-0 mx-2 scale-0
          rounded-sm border border-border bg-popover py-0.75 text-center text-sm
          opacity-0 transition-all duration-200 ease-in-out
          data-[open=true]:scale-100 data-[open=true]:opacity-100
        "
      >
        more...
      </div>
      <div
        data-open={features.scrollBottomBadge.opened ? 'true' : undefined}
        className="
          pointer-events-none absolute right-0 bottom-0 left-0 mx-2 scale-0
          rounded-sm border border-border bg-popover py-0.75 text-center text-sm
          opacity-0 transition-all duration-200 ease-in-out
          data-open:scale-100 data-open:opacity-100
        "
      >
        more...
      </div>
    </div>
  )
}
