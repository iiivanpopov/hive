import { useSuspenseQueries } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { ChevronDownIcon, DoorOpenIcon, GlobeIcon } from 'lucide-react'

import { getAuthMeOptions, getCommunitiesIdOptions } from '@/api/@tanstack/react-query.gen'
import { I18nText } from '@/components/i18n/i18n-text'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Typography } from '@/components/ui/typography'
import { useBoolean } from '@/hooks/use-boolean'

import { LeaveCommunityDialog } from './leave-community-dialog'

export function CommunitySidebarHeader() {
  const { communitySlug } = useParams({
    from: '/(root)/_communities/$communitySlug/_community',
  })

  const [isCommunityDropdownMenuOpen, setIsCommunityDropdownMenuOpen] = useBoolean(false)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useBoolean(false)

  const [communityQuery, authMeQuery] = useSuspenseQueries({
    queries: [
      getCommunitiesIdOptions({
        path: {
          id: communitySlug,
        },
      }),
      getAuthMeOptions(),
    ],
  })

  const isOwner = communityQuery.data.community.ownerId === authMeQuery.data.user.id

  return (
    <>
      <DropdownMenu
        open={isCommunityDropdownMenuOpen}
        onOpenChange={setIsCommunityDropdownMenuOpen}
      >
        <DropdownMenuTrigger className="flex gap-2 cursor-pointer hover:bg-zinc-200 transition-colors px-2 mx-2 py-1 rounded-sm items-center max-w-44 justify-between">
          <div className="flex gap-2 items-center truncate">
            <GlobeIcon size={20} className="shrink-0" />
            <Typography className="font-bold truncate text-secondary-foreground">
              {communityQuery.data.community.name}
            </Typography>
          </div>
          <ChevronDownIcon
            data-open={isCommunityDropdownMenuOpen}
            size={20}
            className="data-open:rotate-180 rotate-0 transition-transform text-secondary-foreground shrink-0"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuItem className="wrap-anywhere">
              {communityQuery.data.community.name}
            </DropdownMenuItem>

            {!isOwner && (
              <>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setIsLeaveDialogOpen(true)}
                  className="text-destructive justify-between flex items-center w-full cursor-pointer"
                >
                  <I18nText id="button.leave-community" />
                  <DoorOpenIcon size={20} />
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <LeaveCommunityDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
      />
    </>
  )
}
