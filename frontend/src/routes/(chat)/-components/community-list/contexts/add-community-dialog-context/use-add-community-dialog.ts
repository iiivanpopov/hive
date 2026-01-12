import { use } from 'react'

import { AddCommunityDialogContext } from './add-community-dialog-context'

export function useAddCommunityDialog() {
  return use(AddCommunityDialogContext)
}
