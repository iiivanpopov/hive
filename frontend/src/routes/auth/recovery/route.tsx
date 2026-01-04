import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/recovery')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/recovery"!</div>
}
