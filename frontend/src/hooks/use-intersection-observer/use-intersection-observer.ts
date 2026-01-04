import { useEffect, useRef, useState } from 'react'

import type { HookTarget } from '@/lib/utils/is-target'

import { isTarget } from '@/lib/utils'

import type { StateRef } from '../use-ref-state/use-ref-state'

import { useRefState } from '../use-ref-state/use-ref-state'

/** The intersection observer callback type */
export type UseIntersectionObserverCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
) => void

/** The intersection observer options type */
export interface UseIntersectionObserverOptions extends Omit<IntersectionObserverInit, 'root'> {
  /** The enabled state of the intersection observer */
  enabled?: boolean
  /** The callback to execute when intersection is detected */
  onChange?: UseIntersectionObserverCallback
  /** The root element to observe */
  root?: HookTarget
}

/** The intersection observer return type */
export interface UseIntersectionObserverReturn {
  /** The intersection observer entry */
  entries?: IntersectionObserverEntry[]
  /** The intersection observer instance */
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
