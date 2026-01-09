import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useRef } from 'react'

import { getCommunitiesJoinedOptions } from '@/api/@tanstack/react-query.gen'
import { useBoolean } from '@/hooks/use-boolean'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'

export function useCommunityList() {
  const params = useParams({ strict: false })

  const communitiesQuery = useSuspenseQuery(getCommunitiesJoinedOptions())

  const containerRef = useRef<HTMLDivElement>(null)
  const firstItemRef = useRef<HTMLDivElement>(null)
  const lastItemRef = useRef<HTMLDivElement>(null)

  const [showScrollTopBadge, setShowScrollTopBadge] = useBoolean(false)
  const [showScrollBottomBadge, setShowScrollBottomBadge] = useBoolean(false)
  const [showAddCommunityDialog, setShowAddCommunityDialog] = useBoolean(false)

  useIntersectionObserver(firstItemRef, {
    root: containerRef,
    threshold: 0.2,
    onChange: entries => setShowScrollTopBadge(entries.every(entry => !entry.isIntersecting)),
  })

  useIntersectionObserver(lastItemRef, {
    root: containerRef,
    threshold: 0.2,
    onChange: entries => setShowScrollBottomBadge(entries.every(entry => !entry.isIntersecting)),
  })

  return {
    state: {
      showScrollTopBadge,
      showScrollBottomBadge,
      showAddCommunityDialog,
      params,
    },
    functions: {
      setShowAddCommunityDialog,
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
