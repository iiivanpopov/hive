import { createFileRoute, redirect } from '@tanstack/react-router'

import { RegisterPage } from './-register-page'

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
  beforeLoad: ({ context }) => {
    if (context.user)
      throw redirect({ to: '/' })
  },
})
