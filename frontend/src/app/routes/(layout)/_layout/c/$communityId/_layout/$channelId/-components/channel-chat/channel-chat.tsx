import { ArrowUpIcon, DotIcon, HashIcon } from 'lucide-react'

import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { Typography } from '@/components/ui/typography'
import { cn } from '@/utils'

import { useChannelChat } from './hooks/useChannelChat'

export function ChannelChat() {
  const { state, refs, functions, features } = useChannelChat()

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div className="flex h-14 items-center border-b border-border px-3">
        <div className="flex items-center gap-2">
          <HashIcon className="size-6" />
          <Typography>
            {state.channel.name}
          </Typography>
        </div>

        {state.channel.description && (
          <>
            <DotIcon className="text-muted-foreground" />
            <Typography className="max-w-sm truncate" variant="caption">
              {state.channel.description}
            </Typography>
          </>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={refs.messagesContainerRef}
          onScroll={functions.handleMessagesScroll}
          className="
            no-scrollbar flex h-full flex-col overflow-y-auto px-4 pt-4 pb-28
          "
        >
          {state.messages.length > 0 && (
            <div
              className={cn(
                'shrink-0',
                state.isLoadingOlderMessages
                  ? 'flex h-6 items-center justify-center'
                  : 'h-px',
              )}
            >
              {state.isLoadingOlderMessages && (
                <Spinner className="text-muted-foreground" />
              )}
            </div>
          )}

          {state.messages.length > 0 && (
            <div className="flex flex-col gap-5">
              {state.messages.map((message) => {
                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      (message.sending || message.failed) && 'opacity-70',
                    )}
                  >
                    <div className="
                      flex size-10 shrink-0 items-center justify-center
                      rounded-full bg-muted text-sm font-medium text-foreground
                    "
                    >
                      {message.avatarFallback}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Typography className="text-sm font-semibold">
                          {message.author}
                        </Typography>
                        <Typography className="text-[11px]" variant="caption">
                          {message.messageTime}
                        </Typography>
                        {message.sending && (
                          <Typography className="text-[11px]" variant="caption">
                            <I18nText id="channel-chat.message.sending" />
                          </Typography>
                        )}
                        {message.failed && (
                          <Typography className="text-[11px] text-destructive" variant="caption">
                            <I18nText id="channel-chat.message.failed" />
                          </Typography>
                        )}
                      </div>

                      <Typography className="
                        text-sm/6 wrap-break-word whitespace-pre-wrap
                      "
                      >
                        {message.content}
                      </Typography>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!state.messages.length && (
            <div className="flex min-h-full items-end px-2 pb-2">
              <div className="max-w-2xl space-y-3">
                <div className="
                  flex size-20 items-center justify-center rounded-2xl border
                  border-border bg-muted/50
                "
                >
                  <HashIcon className="size-10" />
                </div>

                <Typography className="text-4xl font-semibold" tag="h1">
                  <I18nText
                    id="channel-chat.empty.title"
                    values={{ channelName: state.channel.name }}
                  />
                </Typography>

                <Typography className="text-base text-muted-foreground">
                  <I18nText
                    id="channel-chat.empty.description"
                    values={{ channelName: state.channel.name }}
                  />
                </Typography>

                {state.channel.description && (
                  <Typography className="text-sm text-muted-foreground">
                    {state.channel.description}
                  </Typography>
                )}
              </div>
            </div>
          )}

          <div ref={refs.messagesEndRef} className="h-1 shrink-0 scroll-mb-28" />
        </div>

        <form
          className="absolute inset-x-4 bottom-4"
          onSubmit={(event) => {
            event.preventDefault()
            features.input.submitMessage()
          }}
        >
          <div
            className="
              rounded-md border border-border bg-popover p-2 shadow-sm
              backdrop-blur-sm
              supports-backdrop-filter:bg-popover/95
            "
          >
            <div className="flex items-start gap-2">
              <Textarea
                ref={features.input.textareaRef}
                value={features.input.draft}
                onChange={event => features.input.setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' || event.shiftKey)
                    return

                  event.preventDefault()
                  features.input.submitMessage()
                }}
                className="
                  min-h-9 flex-1 resize-none border-none bg-transparent! px-2
                  py-1.5 shadow-none
                  focus-visible:ring-0
                "
                rows={1}
                maxLength={1000}
                placeholder={features.i18n.t('channel-chat.input.placeholder', { channelName: state.channel.name })}
              />

              <Button size="icon-sm" type="submit" disabled={!features.input.canSendMessage}>
                <ArrowUpIcon className="size-4" />
                <span className="sr-only">
                  <I18nText id="button.send" />
                </span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
