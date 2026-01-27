import { Link } from '@tanstack/react-router'

import { AddCommunityDialog } from './components'
import { useCommunityList } from './hooks'
import { AddCommunityDialogProvider } from './providers'

export function CommunityList() {
  const { features, state, refs, queries } = useCommunityList()

  return (
    <div
      ref={refs.container}
      className="relative w-full h-10/12 overflow-hidden"
    >
      <div className="no-scrollbar overflow-y-auto h-full flex flex-col items-center gap-4">
        {queries.communities.data.communities.map((community, i) => (
          <div
            key={community.id}
            ref={i === 0 ? refs.firstItem : null}
            className="relative w-20 flex justify-center items-center"
          >
            <Link
              to="/c/$communityId"
              params={{ communityId: String(community.id) }}
              className="block size-10"
            >
              <div className="size-10 rounded-md flex justify-center items-center bg-zinc-100 dark:bg-zinc-800 text-primary-foreground font-bold text-2xl cursor-pointer">
                {community.name.at(0)!.toUpperCase()}
              </div>
            </Link>
            <div
              data-active={Number(state.params.communityId) === community.id}
              className="scale-0 opacity-0 data-active:scale-100 data-active:opacity-100 transition-all absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1.25 rounded-tr-3xl rounded-br-3xl bg-primary"
            />
          </div>
        ))}

        <AddCommunityDialogProvider>
          <AddCommunityDialog ref={refs.lastItem} />
        </AddCommunityDialogProvider>
      </div>

      <div
        data-open={features.scrollTopBadge.opened}
        className="scale-0 opacity-0 data-open:opacity-100 data-open:scale-100 transition-all duration-200 ease-in-out absolute top-0 left-0 right-0 text-center mx-2 py-0.75 bg-popover rounded-sm pointer-events-none text-sm"
      >
        more...
      </div>
      <div
        data-open={features.scrollBottomBadge.opened}
        className="scale-0 opacity-0 data-open:opacity-100 data-open:scale-100 transition-all duration-200 ease-in-out absolute bottom-0 left-0 right-0 text-center mx-2 py-0.75 bg-popover rounded-sm pointer-events-none text-sm"
      >
        more...
      </div>
    </div>
  )
}
