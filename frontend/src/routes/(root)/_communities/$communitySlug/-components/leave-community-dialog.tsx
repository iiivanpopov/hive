import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'

import { getCommunitiesIdOptions, getCommunitiesJoinedQueryKey, postCommunitiesLeaveIdMutation } from '@/api/@tanstack/react-query.gen'
import { I18nText } from '@/components/i18n/i18n-text'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Typography } from '@/components/ui/typography'
import { useI18n } from '@/providers/i18n-provider'
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
  const { t } = useI18n()

  const communityQuery = useSuspenseQuery(getCommunitiesIdOptions({
    path: {
      id: communitySlug,
    },
  }))

  const leaveMutation = useMutation({
    ...postCommunitiesLeaveIdMutation(),
    onSuccess: async () => {
      toast.success(t('toast.leaved-community', { name: communityQuery.data.community.name }))
    },
  })

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
        <DialogFooter
          showCloseButton={true}
          closeButtonChildren={t('button.cancel')}
        >
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
