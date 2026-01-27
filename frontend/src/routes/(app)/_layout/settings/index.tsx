import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/_layout/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/settings/"!</div>
}
