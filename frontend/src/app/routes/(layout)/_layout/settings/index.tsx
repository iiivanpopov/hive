import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(layout)/_layout/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/settings/"!</div>
}
