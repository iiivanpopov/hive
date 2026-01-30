import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(layout)/_layout/c/$communityId/_layout/')({
  component: CommunityPage,
})

function CommunityPage() {
  return (
    <div className="h-full flex gap-4">
      asdasd
    </div>
  )
}
