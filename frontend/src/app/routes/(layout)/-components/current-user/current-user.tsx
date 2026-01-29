import { Link } from '@tanstack/react-router'
import { LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react'

import { I18nText } from '@/components/i18n'
import { buttonVariants } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx'

import { useCurrentUser } from './hooks'

export function CurrentUser() {
  const { state, functions } = useCurrentUser()

  return (
    <div className="bg-popover border rounded-md border-border w-48 absolute bottom-3 left-4 p-1.5 flex justify-between items-center">
      <DropdownMenu>
        <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          {state.context.user!.name ?? state.context.user!.username}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <I18nText id="dropdown.user.label" />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="size-4" />
              <I18nText id="dropdown.user.profile.label" />
            </DropdownMenuItem>
            <DropdownMenuItem render={props => <Link to="/settings" {...props} />}>
              <SettingsIcon className="size-4" />
              <I18nText id="dropdown.user.settings.label" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={functions.onLogout}
            >
              <LogOutIcon className="size-4" />
              <I18nText id="dropdown.user.logout.label" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Link
        to="/settings"
        className={buttonVariants({ size: 'icon-sm', variant: 'ghost' })}
      >
        <SettingsIcon className="size-5" />
      </Link>
    </div>
  )
}
