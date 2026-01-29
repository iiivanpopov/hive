import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(layout)/_layout/settings/')({
  component: SettingsPage,
  head: () => ({
    meta: [{ title: ' Hive | Settings' }],
  }),
})

function SettingsPage() {
  return <div>Hello "/settings/"!</div>
}
