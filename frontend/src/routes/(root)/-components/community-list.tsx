import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { useRef } from 'react'

import { getCommunitiesJoinedOptions } from '@/api/@tanstack/react-query.gen'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useBoolean } from '@/hooks/use-boolean/use-boolean'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer/use-intersection-observer'

import { AddCommunityDialog } from './add-community-dialog'
import { CreateCommunityDialog } from './create-community-dialog'
import { JoinCommunityDialog } from './join-community-dialog'

export function CommunityList() {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const communitiesQuery = useSuspenseQuery(getCommunitiesJoinedOptions())

  const listRef = useRef<HTMLDivElement | null>(null)
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useBoolean(false)
  const [isJoinCommunityModalOpen, setIsJoinCommunityModalOpen] = useBoolean(false)
  const [isAddCommunityPopoverOpen, setIsAddCommunityPopoverOpen] = useBoolean(false)
  const [addServerInView, setAddServerInView] = useBoolean(true)
  const [lastServerInView, setLastServerInView] = useBoolean(true)

  const { ref: addServerRef } = useIntersectionObserver<HTMLButtonElement>({
    root: listRef,
    threshold: 0.2,
    onChange: entries => setAddServerInView(entries.some(e => e.isIntersecting)),
  })

  const { ref: lastServerRef } = useIntersectionObserver<HTMLDivElement>({
    root: listRef,
    threshold: 0.2,
    onChange: entries => setLastServerInView(entries.some(e => e.isIntersecting)),
  })

  const handleAddServerClick = () => setIsAddCommunityPopoverOpen(true)

  return (
    <div className="relative">
      <div
        ref={listRef}
        className="h-[80vh] w-20 flex no-scrollbar flex-col gap-2 overflow-y-auto items-center"
      >
        <Button
          size="icon-lg"
          variant="outline"
          onClick={handleAddServerClick}
          render={props => <button {...props} ref={addServerRef} />}
        >
          <PlusIcon />
        </Button>

        <AddCommunityDialog
          open={isAddCommunityPopoverOpen}
          onOpenChange={setIsAddCommunityPopoverOpen}
          openCreateCommunityDialog={() => setIsCreateCommunityModalOpen(true)}
          openJoinCommunityDialog={() => setIsJoinCommunityModalOpen(true)}
        />

        <CreateCommunityDialog
          open={isCreateCommunityModalOpen}
          onOpenChange={setIsCreateCommunityModalOpen}
        />

        <JoinCommunityDialog
          open={isJoinCommunityModalOpen}
          onOpenChange={setIsJoinCommunityModalOpen}
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
              ref={isLast ? lastServerRef : undefined}
            >
              <Tooltip>
                <TooltipTrigger
                  render={props => (
                    <Button
                      {...props}
                      onClick={handleOpenCommunity}
                      size="icon-lg"
                      className="text-xl font-bold"
                    >
                      {community.name[0]!.toUpperCase()}
                    </Button>
                  )}
                />
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
          className="opacity-0 scale-0 text-sm rounded-sm bg-zinc-200 py-0.5 px-1.5 text-muted-foreground animate-in fade-in zoom-in-0 duration-200 data-open:opacity-100 data-open:scale-100 w-full"
        >
          more...
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-2 right-2">
        <div
          data-open={!lastServerInView}
          className="opacity-0 scale-0 text-sm rounded-sm bg-zinc-200 py-0.5 px-1.5 text-muted-foreground animate-in fade-in zoom-in-0 duration-200 data-open:opacity-100 data-open:scale-100 w-full"
        >
          more...
        </div>
      </div>
    </div>
  )
}
