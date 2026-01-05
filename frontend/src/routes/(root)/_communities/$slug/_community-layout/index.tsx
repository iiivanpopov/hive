import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/_communities/$slug/_community-layout/')({
  component: RouteComponent,
  head: ({ params }) => ({
    meta: [{ title: `#${params.slug}` }],
  }),
})

function RouteComponent() {
  return (
    <div>
      asdasasfsdfsd
    </div>
  )
}
