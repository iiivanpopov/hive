import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/_communities/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(root)/_communities/"!</div>
}
