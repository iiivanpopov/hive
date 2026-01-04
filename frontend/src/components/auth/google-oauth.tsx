import { useNavigate } from '@tanstack/react-router'

import GoogleIcon from '@/assets/icons/google.svg?react'

import { Button } from '../ui/button'

export function GoogleOauth() {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate({ href: `${import.meta.env.VITE_BACKEND_URL}/auth/google` })
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
