import { useCopy } from '@siberiacancode/reactuse'

import { useCreateInvitation } from '@/app/routes/(layout)/_layout/c/$communityId/-providers/create-invitation-provider'
import { getInvitationUrl } from '@/lib/invitations'

export function useViewInvitationScreen() {
  const { invitation } = useCreateInvitation()
  const { copied, copy } = useCopy(1000)
  const invitationUrl = invitation ? getInvitationUrl(invitation) : ''

  const onCopy = async () => {
    await copy(invitationUrl)
  }

  return {
    state: {
      copied,
      invitationToken: invitation,
      invitationUrl,
    },
    functions: {
      onCopy,
    },
  }
}
