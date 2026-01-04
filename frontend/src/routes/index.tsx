import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.user)
      throw redirect({ to: '/auth/login' })
  },
})

function RouteComponent() {
  return <div>Hello "/"!</div>
}
