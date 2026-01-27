import { Link } from '@tanstack/react-router'
import { LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { I18nText } from '@/i18n/components'

import { useCurrentUser } from './hooks'

export function CurrentUser() {
  const { state, functions } = useCurrentUser()

  return (
    <div className="bg-zinc-100 dark:bg-background border rounded-md border-border w-64 absolute bottom-3 left-4 py-2 px-3 flex justify-between items-center">
      <DropdownMenu>
        <DropdownMenuTrigger className="font-semibold truncate cursor-pointer px-2 py-1 rounded-md hover:bg-black/10 hover:dark:bg-white/5 transition-colors">
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
        className={buttonVariants({ size: 'icon', variant: 'ghost' })}
      >
        <SettingsIcon size={20} />
      </Link>
    </div>
  )
}
