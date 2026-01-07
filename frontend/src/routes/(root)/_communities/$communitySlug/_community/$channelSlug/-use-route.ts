import { useSuspenseQuery } from '@tanstack/react-query'

import { getChannelsIdMessagesOptions } from '@/api/@tanstack/react-query.gen'
import { useI18n } from '@/providers/i18n-provider'

import { Route } from './index'

export function useRoute() {
  const params = Route.useParams()
  const i18n = useI18n()

  const messages = useSuspenseQuery(getChannelsIdMessagesOptions({
    path: {
      id: params.channelSlug,
    },
    query: {
      limit: 20,
    },
  }))

  return {
    params,
    i18n,
    functions: {
    },
    queries: {
      messages,
    },
    mutations: {
    },
  }
}
