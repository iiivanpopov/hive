import { ChevronDownIcon, DoorOpenIcon, LinkIcon } from 'lucide-react'

import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { CreateInvitationDialog } from './components/create-invitation-dialog'
import { useCommunityHeader } from './hooks/use-community-header'

export function CommunityHeader() {
  const { queries, features } = useCommunityHeader()

  return (
    <div className="p-3">
      <DropdownMenu open={features.dropdownMenu.opened} onOpenChange={features.dropdownMenu.toggle}>
        <DropdownMenuTrigger
          render={props => (
            <Button
              {...props}
              variant="ghost"
              className="gap-2 w-full py-1 px-1.5 rounded-md font-semibold cursor-pointer transition-colors flex justify-between items-center text-base"
            >
              <span className="truncate">
                {queries.community.data.community.name}
              </span>
              <ChevronDownIcon
                data-open={features.dropdownMenu.opened}
                className="shrink-0 size-5 data-[open=true]:rotate-180 transition-transform"
              />
            </Button>
          )}
        />
        <DropdownMenuContent className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className="wrap-break-word line-clamp-2">
                {queries.community.data.community.name}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => features.createInvitation.dialog.open()}
              className="cursor-pointer justify-between items-center transition-colors"
            >
              <I18nText id="dropdown.create-invitation.title" />
              <LinkIcon className="size-4" />
            </DropdownMenuItem>

            <DropdownMenuSeparator className="w-4/5! mx-auto" />

            <DropdownMenuItem className="cursor-pointer justify-between items-center text-destructive">
              <I18nText id="dropdown.leave-community.title" />
              <DoorOpenIcon className="size-4" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {features.createInvitation.dialog.opened && (
        <CreateInvitationDialog />
      )}
    </div>
  )
}
