import { useState } from 'react'

/** The use disclosure options type */
export interface UseDisclosureOptions {
  /** The callback function to be invoked on close */
  onClose?: () => void
  /** The callback function to be invoked on open */
  onOpen?: () => void
}

/** The use disclosure return type */
export interface UseDisclosureReturn {
  opened: boolean
  close: () => void
  open: () => void
  toggle: (newOpened?: boolean) => void
}

export function useDisclosure(initialValue = false, options?: UseDisclosureOptions): UseDisclosureReturn {
  const [opened, setOpened] = useState(initialValue)

  const open = () =>
    setOpened((opened) => {
      if (!opened) {
        options?.onOpen?.()
        return true
      }
      return opened
    })

  const close = () =>
    setOpened((opened) => {
      if (opened) {
        options?.onClose?.()
        return false
      }
      return opened
    })

  const toggle = (newOpened?: boolean) => {
    if (newOpened !== undefined) {
      setOpened(newOpened)
    }
    else {
      setOpened((opened) => {
        if (!opened) {
          options?.onOpen?.()
          return true
        }
        options?.onClose?.()
        return false
      })
    }
  }

  return { opened, open, close, toggle }
}
