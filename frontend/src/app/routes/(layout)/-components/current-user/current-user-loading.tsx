import { SettingsIcon } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'

export function CurrentUserLoading() {
  return (
    <div className="
      absolute bottom-3 left-4 flex w-48 items-center justify-between rounded-md
      border border-border bg-popover p-1.5
    "
    >
      <div
        className={buttonVariants({
          variant: 'ghost',
          size: 'sm',
          class:
            'w-28 justify-start bg-muted/50 hover:bg-muted/50 text-transparent animate-pulse cursor-auto! pointer-events-none',
        })}
        style={{ animationDelay: '0.05s' }}
        aria-hidden
      />

      <div
        className={buttonVariants({
          size: 'icon-sm',
          variant: 'ghost',
          class:
            'bg-muted/50 hover:bg-muted/50 animate-pulse cursor-auto! pointer-events-none',
        })}
        style={{ animationDelay: '0.15s' }}
        aria-hidden
      >
        <SettingsIcon className="size-5 opacity-0" />
      </div>
    </div>
  )
}
