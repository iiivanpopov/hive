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
              className="
                flex w-full cursor-pointer items-center justify-between gap-2
                rounded-md px-1.5 py-1 text-base font-semibold transition-colors
              "
            >
              <span className="truncate">
                {queries.community.data.community.name}
              </span>
              <ChevronDownIcon
                data-open={features.dropdownMenu.opened}
                className="
                  size-5 shrink-0 transition-transform
                  data-[open=true]:rotate-180
                "
              />
            </Button>
          )}
        />
        <DropdownMenuContent className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className="line-clamp-2 wrap-break-word">
                {queries.community.data.community.name}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => features.createInvitation.dialog.open()}
              className="
                cursor-pointer items-center justify-between transition-colors
              "
            >
              <I18nText id="dropdown.create-invitation.title" />
              <LinkIcon className="size-4" />
            </DropdownMenuItem>

            <DropdownMenuSeparator className="mx-auto w-4/5!" />

            <DropdownMenuItem className="
              cursor-pointer items-center justify-between text-destructive
            "
            >
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
