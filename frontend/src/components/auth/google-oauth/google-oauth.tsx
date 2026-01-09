import { useNavigate } from '@tanstack/react-router'

import GoogleIcon from '@/assets/icons/google.svg?react'
import { Button } from '@/components/ui/button'
import { env } from '@/config'

export function GoogleOauth() {
  const navigate = useNavigate()

  const handleClick = async () => {
    await navigate({ href: `${env.apiBaseUrl}/auth/google` })
  }

  return (
    <Button
      onClick={handleClick}
      className="w-full"
      variant="outline"
    >
      <GoogleIcon className="size-4 fill-secondary-foreground" />
      Google
    </Button>
  )
}
