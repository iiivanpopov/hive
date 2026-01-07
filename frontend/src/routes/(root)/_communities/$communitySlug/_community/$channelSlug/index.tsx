import { createFileRoute } from '@tanstack/react-router'
import { HashIcon, SendIcon } from 'lucide-react'

import { getChannelsIdMessagesOptions } from '@/api/@tanstack/react-query.gen'
import { I18nText } from '@/components/i18n/i18n-text'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Typography } from '@/components/ui/typography'
import { queryClient } from '@/providers/query-provider'

import { useRoute } from './-use-route'

export const Route = createFileRoute(
  '/(root)/_communities/$communitySlug/_community/$channelSlug/',
)({
  component: RouteComponent,
  head: ({ params }) => ({
    meta: [{ title: `#${params.channelSlug}` }],
  }),
  loader: ({ params }) => queryClient.ensureQueryData(getChannelsIdMessagesOptions({
    path: {
      id: params.channelSlug,
    },
    query: {
      limit: 20,
    },
  })),
})

function RouteComponent() {
  const { params, i18n, queries } = useRoute()

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="h-4.25 bg-zinc-100 border-b border-border" />
      <div className="flex px-4 items-center h-12.25 bg-zinc-100 border-b border-border">
        <div className="flex gap-2">
          <HashIcon />
          {params.channelSlug}
        </div>
      </div>
      <div className="flex-1 flex flex-col p-2">
        <div className="flex-1">
          {!queries.messages.data.messages.length && (
            <Typography variant="caption" className="text-center text-muted-foreground mt-4">
              <I18nText id="text.no-messages" />
            </Typography>
          )}
          {queries.messages.data.messages.map(message => (
            <div key={message.id} className="mb-2">
              <div className="font-semibold">{message.userId}</div>
              <div>{message.content}</div>
            </div>
          ))}
        </div>
        <div className="relative">
          <Textarea
            className="max-h-[20vh]"
            placeholder={i18n.t('field.message.placeholder')}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-3 bottom-0 mb-3.5"
          >
            <SendIcon />
          </Button>
        </div>
      </div>
      <div className="h-4.25 bg-zinc-100 border-t border-border" />
    </div>
  )
}
