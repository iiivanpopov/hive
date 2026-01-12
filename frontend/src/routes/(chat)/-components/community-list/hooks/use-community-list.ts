import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useRef } from 'react'

import { getCommunitiesJoinedOptions } from '@/api/@tanstack/react-query.gen'
import { useDisclosure } from '@/hooks/use-disclosure'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'

export function useCommunityList() {
  const params = useParams({ strict: false })

  const communitiesQuery = useSuspenseQuery(getCommunitiesJoinedOptions())

  const containerRef = useRef<HTMLDivElement>(null)
  const firstItemRef = useRef<HTMLDivElement>(null)
  const lastItemRef = useRef<HTMLDivElement>(null)

  const addCommunityDialog = useDisclosure()
  const scrollTopBadge = useDisclosure()
  const scrollBottomBadge = useDisclosure()

  useIntersectionObserver(firstItemRef, {
    root: containerRef,
    threshold: 0.2,
    onChange: entries => scrollTopBadge.toggle(entries.every(entry => !entry.isIntersecting)),
  })

  useIntersectionObserver(lastItemRef, {
    root: containerRef,
    threshold: 0.2,
    onChange: entries => scrollBottomBadge.toggle(entries.every(entry => !entry.isIntersecting)),
  })

  return {
    features: {
      addCommunityDialog,
      scrollTopBadge,
      scrollBottomBadge,
    },
    state: {
      params,
    },
    refs: {
      container: containerRef,
      lastItem: lastItemRef,
      firstItem: firstItemRef,
    },
    queries: {
      communities: communitiesQuery,
    },
  }
}
