/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
import { useEffect, useRef, useState } from 'react'

import type { StateRef } from '@/hooks/use-ref-state'
import type { HookTarget } from '@/utils/is-target'

import { useRefState } from '@/hooks/use-ref-state'
import { isTarget } from '@/utils'

export type UseIntersectionObserverCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
) => void

export interface UseIntersectionObserverOptions extends Omit<IntersectionObserverInit, 'root'> {
  enabled?: boolean
  onChange?: UseIntersectionObserverCallback
  root?: HookTarget
}

export interface UseIntersectionObserverReturn {
  entries?: IntersectionObserverEntry[]
  observer?: IntersectionObserver
}

export interface UseIntersectionObserver {
  <Target extends Element>(
    options?: UseIntersectionObserverOptions,
    target?: never
  ): UseIntersectionObserverReturn & { ref: StateRef<Target> }

  (target: HookTarget, options?: UseIntersectionObserverOptions): UseIntersectionObserverReturn

  <Target extends Element>(
    callback: UseIntersectionObserverCallback,
    target?: never
  ): UseIntersectionObserverReturn & { ref: StateRef<Target> }

  (target: HookTarget, callback: UseIntersectionObserverCallback): UseIntersectionObserverReturn
}

export const useIntersectionObserver = ((...params: any[]) => {
  const target = (isTarget(params[0]) ? params[0] : undefined) as HookTarget | undefined

  const options = (
    target
      ? typeof params[1] === 'object'
        ? params[1]
        : { onChange: params[1] }
      : typeof params[0] === 'object'
        ? params[0]
        : { onChange: params[0] }
  ) as UseIntersectionObserverOptions | undefined

  const callback = options?.onChange
  const enabled = options?.enabled ?? true

  const [observer, setObserver] = useState<IntersectionObserver>()
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>()

  const internalRef = useRefState<Element>()
  const internalCallbackRef = useRef(callback)
  internalCallbackRef.current = callback

  useEffect(() => {
    if (!enabled || (!target && !internalRef.state))
      return

    const element = target ? isTarget.getElement(target) : internalRef.current
    if (!element)
      return

    const observer = new IntersectionObserver(
      (entries, observer) => {
        setEntries(entries)
        internalCallbackRef.current?.(entries, observer)
      },
      {
        ...options,
        root: options?.root ? (isTarget.getElement(options.root) as Document | Element) : document,
      },
    )

    setObserver(() => observer)
    observer.observe(element as Element)

    return () => {
      observer.disconnect()
    }
  }, [
    target,
    internalRef.state,
    isTarget.getRefState(target),
    options?.rootMargin,
    options?.threshold,
    options?.root,
    enabled,
  ])

  if (target)
    return { observer, entries }
  return {
    observer,
    ref: internalRef,
    entries,
  }
}) as UseIntersectionObserver
