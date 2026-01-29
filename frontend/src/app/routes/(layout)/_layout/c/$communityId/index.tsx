import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(layout)/_layout/c/$communityId/')({
  component: SettingsPage,
})

function SettingsPage() {
  return <div>Hello "/(chat)/_layout/$communityId/"!</div>
}
