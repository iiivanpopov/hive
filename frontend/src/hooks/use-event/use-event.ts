/* eslint-disable react-hooks/refs */
import { useCallback, useRef } from 'react'

export function useEvent<Params extends unknown[], Return>(callback: (...args: Params) => Return): ((...args: Params) => Return) {
  const internalCallbackRef = useRef<typeof callback>(callback)
  internalCallbackRef.current = callback

  return useCallback((...args) => {
    const fn = internalCallbackRef.current
    return fn(...args)
  }, [])
}
