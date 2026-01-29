import GoogleIcon from '@/assets/icons/google.svg?react'
import { buttonVariants } from '@/components/ui/button'
import { env } from '@/config/env.ts'

export function GoogleOauth() {
  return (
    <a
      href={`${env.apiUrl}/auth/google`}
      className={buttonVariants({ variant: 'outline', class: 'w-full' })}
    >
      <GoogleIcon className="size-4 fill-secondary-foreground" />
      Google
    </a>
  )
}
