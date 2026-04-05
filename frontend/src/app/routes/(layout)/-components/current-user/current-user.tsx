import { Link } from '@tanstack/react-router'
import { LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react'

import { I18nText } from '@/components/i18n'
import { buttonVariants } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx'

import { useCurrentUser } from './hooks/use-current-user'

export function CurrentUser() {
  const { state, functions } = useCurrentUser()

  return (
    <div className="
      absolute bottom-2 left-2 flex w-64 items-center justify-between gap-2
      rounded-md border border-border bg-popover p-2
    "
    >
      <DropdownMenu>
        <DropdownMenuTrigger className="
          flex w-full cursor-pointer items-center gap-3 rounded-sm px-1.5 py-1
          transition-colors
          hover:bg-muted
          dark:hover:bg-muted/50
        "
        >
          <div className="
            size-10 rounded-full bg-zinc-200
            dark:bg-zinc-700
          "
          />
          <div className="h-10 w-32">
            <div className="truncate text-left font-semibold">
              {state.user?.name ?? state.user?.username}
            </div>
            <div className="text-left text-xs text-muted-foreground">
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
            <DropdownMenuItem className="cursor-pointer" render={props => <Link to="/profile" {...props} />}>
              <UserIcon className="size-4" />
              <I18nText id="dropdown.account.profile" />
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" render={props => <Link to="/settings" {...props} />}>
              <SettingsIcon className="size-4" />
              <I18nText id="dropdown.account.settings" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive"
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
