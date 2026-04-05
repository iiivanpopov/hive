import { PlusIcon } from 'lucide-react'

import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'

import { useChannelsList } from './hooks/use-channels-list'

export function ChannelsList() {
  const { queries } = useChannelsList()

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between p-3">
        <span className="text-sm text-muted-foreground select-none">
          <I18nText id="channels.text.title" />
        </span>
        <Button
          size="icon-xs"
          variant="ghost"
          className="text-muted-foreground"
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>

      {queries.channels.data?.channels.map(channel => (
        <div key={channel.id}>
          #
          {channel.name}
        </div>
      ))}
    </div>
  )
}
