import { Link } from '@tanstack/react-router'
import { MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { ChannelDeleteDialog, CreateChannelDialog, UpdateChannelDialog } from './components'
import { useChannelsList } from './hooks/use-channels-list'

export function ChannelsList() {
  const { state, queries, mutations, functions, features } = useChannelsList()

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between p-3">
          <span className="text-sm text-muted-foreground select-none">
            <I18nText id="channels.text.title" />
          </span>
          {state.isOwner && (
            <Button
              size="icon-xs"
              variant="ghost"
              className="text-muted-foreground"
              onClick={functions.openCreate}
            >
              <PlusIcon className="size-4" />
            </Button>
          )}
        </div>

        {!queries.channels.data.channels.length && (
          <div className="px-3 text-sm text-muted-foreground">
            <I18nText id="channels.text.empty" />
          </div>
        )}

        <div className="flex flex-col gap-1.5 px-2">
          {queries.channels.data.channels.map(channel => (
            <div
              key={channel.id}
              className="
                flex items-center gap-1 rounded-sm px-1 py-0.5
                text-muted-foreground transition-colors
                hover:bg-muted hover:text-foreground
                data-[active=true]:bg-muted data-[active=true]:font-medium
                data-[active=true]:text-foreground
              "
              data-active={state.channelId === channel.id}
            >
              <Link
                to="/c/$communityId/$channelId"
                params={{
                  communityId: channel.communityId,
                  channelId: channel.id,
                }}
                className="flex min-w-0 flex-1 items-center gap-2 p-1 text-sm"
              >
                <span className="text-base leading-none text-current">#</span>
                <span className="truncate">{channel.name}</span>
              </Link>

              {state.isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={props => (
                      <Button
                        {...props}
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 text-current"
                      />
                    )}
                  >
                    <MoreHorizontalIcon className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 min-w-36">
                    <DropdownMenuItem onClick={() => functions.openUpdate(channel)}>
                      <PencilIcon className="size-4" />
                      <I18nText id="dropdown.edit-channel.title" />
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => functions.openDelete(channel)}>
                      <Trash2Icon className="size-4" />
                      <I18nText id="dropdown.delete-channel.title" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      </div>

      {features.createDialog.opened && (
        <CreateChannelDialog
          onOpenChange={features.createDialog.toggle}
          onSubmit={functions.createChannel}
          isPending={mutations.createChannel.isPending}
        />
      )}

      {features.updateDialog.opened && (
        <UpdateChannelDialog
          channel={state.editingChannel}
          onOpenChange={features.updateDialog.toggle}
          onSubmit={functions.updateChannel}
          isPending={mutations.updateChannel.isPending}
        />
      )}

      {features.deleteDialog.opened && (
        <ChannelDeleteDialog
          channel={state.channelToDelete}
          onOpenChange={features.deleteDialog.toggle}
          onDelete={functions.deleteChannel}
          isPending={mutations.deleteChannel.isPending}
        />
      )}
    </>
  )
}
