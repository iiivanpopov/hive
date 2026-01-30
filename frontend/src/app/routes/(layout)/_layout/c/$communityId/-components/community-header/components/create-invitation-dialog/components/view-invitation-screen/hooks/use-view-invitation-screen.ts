import { useEffect, useRef, useState } from 'react'

import { useCreateInvitation } from '@/app/routes/(layout)/_layout/c/$communityId/-providers/create-invitation-provider'

export function useViewInvitationScreen() {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number>(null)

  const { invitation } = useCreateInvitation()

  const onCopy = async () => {
    await navigator.clipboard.writeText(invitation ?? '')
    setCopied(true)

    timeoutRef.current = setTimeout(() => setCopied(false), 1000)
  }

  useEffect(() => () => clearTimeout(timeoutRef.current ?? undefined), [])

  return {
    state: {
      copied,
      invitation,
    },
    functions: {
      onCopy,
    },
  }
}
