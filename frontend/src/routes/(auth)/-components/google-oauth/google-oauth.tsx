import { useNavigate } from '@tanstack/react-router'

import GoogleIcon from '@/assets/icons/google.svg?react'
import { Button } from '@/components/ui/button'
import { env } from '@/routes/-config/env'

export function GoogleOauth() {
  const navigate = useNavigate()

  return (
    <Button
      onClick={() => navigate({ href: `${env.apiUrl}/auth/google` })}
      className="w-full"
      variant="outline"
    >
      <GoogleIcon className="size-4 fill-secondary-foreground" />
      Google
    </Button>
  )
}
