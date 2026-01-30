import { use } from 'react'

import { CreateInvitationContext } from './create-invitation-context'

export function useCreateInvitation() {
  return use(CreateInvitationContext)
}
