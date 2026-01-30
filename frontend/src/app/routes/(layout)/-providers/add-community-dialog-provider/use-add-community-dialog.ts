import { use } from 'react'

import { AddCommunityDialogContext } from './add-community-dialog-context.ts'

export function useAddCommunityDialog() {
  return use(AddCommunityDialogContext)
}
