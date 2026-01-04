import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/_communities/$slug/')({
  component: RouteComponent,
  head: ({ params }) => ({
    meta: [
      { title: `#${params.slug}` },
    ],
  }),
})

function RouteComponent() {
  return <div>Hello "/(root)/_communities/$slug/"!</div>
}
