import { use } from 'react'

import { AddCommunityDialogContext } from '@/app/routes/(layout)/-components'

export function useAddCommunityDialog() {
  return use(AddCommunityDialogContext)
}
