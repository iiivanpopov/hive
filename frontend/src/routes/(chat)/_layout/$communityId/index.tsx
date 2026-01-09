import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(chat)/_layout/$communityId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(chat)/_layout/$communityId/"!</div>
}
