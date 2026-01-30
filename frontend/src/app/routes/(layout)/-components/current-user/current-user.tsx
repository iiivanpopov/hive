import { Link } from '@tanstack/react-router'
import { LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react'

import { I18nText } from '@/components/i18n'
import { buttonVariants } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx'

import { useCurrentUser } from './hooks/use-current-user'

export function CurrentUser() {
  const { state, functions } = useCurrentUser()

  return (
    <div className="bg-popover border rounded-md border-border w-64 absolute bottom-2 left-2 p-1 flex justify-between items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="hover:bg-muted dark:hover:bg-muted/50 flex w-full gap-3 py-1 px-1.5 rounded-sm items-center transition-colors cursor-pointer">
          <div className="size-10 rounded-full dark:bg-zinc-700 bg-zinc-200" />
          <div className="h-10 w-32">
            <div className="text-left font-semibold truncate">
              {state.user?.name ?? state.user?.username}
            </div>
            <div className="text-xs text-left text-muted-foreground">
              <I18nText id="status.online" />
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <I18nText id="dropdown.account.label" />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="size-4" />
              <I18nText id="dropdown.account.profile" />
            </DropdownMenuItem>
            <DropdownMenuItem render={props => <Link to="/settings" {...props} />}>
              <SettingsIcon className="size-4" />
              <I18nText id="dropdown.account.settings" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={functions.onLogout}
            >
              <LogOutIcon className="size-4" />
              <I18nText id="dropdown.account.logout" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Link
        to="/settings"
        className={buttonVariants({ variant: 'ghost', size: 'icon-lg' })}
      >
        <SettingsIcon />
      </Link>
    </div>
  )
}
