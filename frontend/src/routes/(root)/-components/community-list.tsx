import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { useRef } from 'react'

import { getCommunitiesJoinedOptions } from '@/api/@tanstack/react-query.gen'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useBoolean } from '@/hooks/use-boolean/use-boolean'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer/use-intersection-observer'

import { CreateCommunityDialog } from './create-community-dialog'

export function CommunityList() {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const communitiesQuery = useSuspenseQuery(getCommunitiesJoinedOptions())

  const listRef = useRef<HTMLDivElement | null>(null)
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useBoolean(false)
  const [addServerInView, setAddServerInView] = useBoolean(true)
  const [lastServerInView, setLastServerInView] = useBoolean(true)

  const { ref: addServerRef } = useIntersectionObserver<HTMLButtonElement>({
    root: listRef,
    threshold: 0.2,
    onChange: entries => setAddServerInView(entries.some(e => e.isIntersecting)),
  })

  const { ref: lastServerRef } = useIntersectionObserver<HTMLButtonElement>({
    root: listRef,
    threshold: 0.2,
    onChange: entries => setLastServerInView(entries.some(e => e.isIntersecting)),
  })

  return (
    <div className="relative">
      <div
        ref={listRef}
        className="h-[80vh] w-20 flex no-scrollbar flex-col gap-2 overflow-y-auto items-center"
      >
        <Button
          ref={addServerRef}
          onClick={() => setIsCreateCommunityModalOpen(true)}
          size="icon-lg"
          variant="outline"
        >
          <PlusIcon />
        </Button>

        <CreateCommunityDialog
          open={isCreateCommunityModalOpen}
          onOpenChange={setIsCreateCommunityModalOpen}
        />

        {communitiesQuery.data.communities.map((community, i) => {
          const isActive = params.communitySlug === community.slug
          const isLast = i === communitiesQuery.data.communities.length - 1

          const handleOpenCommunity = async () => await navigate({
            to: '/$communitySlug',
            params: { communitySlug: community.slug },
          })

          return (
            <div
              key={community.id}
              className="w-20 h-10 flex justify-center relative"
            >
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    ref={isLast ? lastServerRef : undefined}
                    size="icon-lg"
                    onClick={handleOpenCommunity}
                  >
                    <span className="text-xl font-bold select-none">
                      {community.name[0]!.toUpperCase()}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {community.name}
                </TooltipContent>
              </Tooltip>
              {isActive && (
                <div className="absolute w-3 h-8 rounded-br-sm rounded-tr-sm bg-primary left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 animate-in fade-in zoom-in-0 duration-200" />
              )}
            </div>
          )
        })}
      </div>

      <div className="pointer-events-none absolute top-0 left-2 right-2">
        <div
          data-open={!addServerInView}
          className="opacity-0 scale-0 text-sm rounded-sm bg-zinc-200 py-0.5 px-1.5 text-muted-foreground animate-in fade-in zoom-in-0 duration-200 data-open:opacity-100 data-open:scale-100"
        >
          more...
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-2 right-2">
        <div
          data-open={!lastServerInView}
          className="opacity-0 scale-0 text-sm rounded-sm bg-zinc-200 py-0.5 px-1.5 text-muted-foreground animate-in fade-in zoom-in-0 duration-200 data-open:opacity-100 data-open:scale-100"
        >
          more...
        </div>
      </div>
    </div>
  )
}
