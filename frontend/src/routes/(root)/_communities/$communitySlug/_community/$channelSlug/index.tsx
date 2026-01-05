import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(root)/_communities/$communitySlug/_community/$channelSlug/',
)({
  component: RouteComponent,
  head: ({ params }) => ({
    meta: [{ title: `#${params.channelSlug}` }],
  }),
})

function RouteComponent() {
  return <div>Hello "/(root)/_communities/$communitySlug/$channelSlug/"!</div>
}
