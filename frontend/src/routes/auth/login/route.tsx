import { createFileRoute, redirect } from '@tanstack/react-router'

import { LoginPage } from './-login-page'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
  beforeLoad: ({ context }) => {
    if (context.user)
      throw redirect({ to: '/' })
  },
})
