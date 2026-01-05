import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'

import { getCommunitiesIdOptions, getCommunitiesJoinedQueryKey, postCommunitiesLeaveIdMutation } from '@/api/@tanstack/react-query.gen'
import { I18nText } from '@/components/i18n/i18n-text'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Typography } from '@/components/ui/typography'
import { queryClient } from '@/providers/query-provider'

interface LeaveCommunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeaveCommunityDialog({
  open,
  onOpenChange,
}: LeaveCommunityDialogProps) {
  const { communitySlug } = useParams({ from: '/(root)/_communities/$communitySlug/_community' })
  const navigate = useNavigate()

  const leaveMutation = useMutation(postCommunitiesLeaveIdMutation())

  const communityQuery = useSuspenseQuery(getCommunitiesIdOptions({
    path: {
      id: communitySlug,
    },
  }))

  const handleLeaveConfirm = async () => {
    await leaveMutation.mutateAsync({
      path: {
        id: communityQuery.data.community.id,
      },
    })

    await queryClient.invalidateQueries({
      queryKey: getCommunitiesJoinedQueryKey(),
    })

    await navigate({ to: '/' })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Typography variant="heading">
              <I18nText id="dialog.leave-community.title" />
            </Typography>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <I18nText id="dialog.leave-community.description" />
        </DialogDescription>
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">
              <I18nText id="button.cancel" />
            </Button>
          </DialogClose>
          <Button
            onClick={handleLeaveConfirm}
            variant="destructive"
          >
            <I18nText id="button.leave-community" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
