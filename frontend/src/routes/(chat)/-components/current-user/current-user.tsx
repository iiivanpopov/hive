import { LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { I18nText } from '@/routes/-contexts/i18n/components/i18n-text'

import { useCurrentUser } from './hooks/use-current-user'

export function CurrentUser() {
  const { state, functions } = useCurrentUser()

  return (
    <div className="bg-background border rounded-md border-border w-64 absolute bottom-3 left-4 py-2 px-3 flex justify-between items-center">
      <DropdownMenu>
        <DropdownMenuTrigger className="font-semibold truncate cursor-pointer px-2 py-1 rounded-md hover:bg-black/10">
          {state.context.user!.name ?? state.context.user!.username}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <I18nText id="dropdown.user.label" />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="size-4" />
              <I18nText id="dropdown.user.profile.label" />
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon className="size-4" />
              <I18nText id="dropdown.user.settings.label" />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={functions.handleLogout}
            >
              <LogOutIcon className="size-4" />
              <I18nText id="dropdown.user.logout.label" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        size="icon"
        variant="ghost"
      >
        <SettingsIcon size={20} />
      </Button>
    </div>
  )
}
