import type { ReactNode, RefObject } from 'react'

import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

import type { AddCommunityDialogScreen } from '../../providers'

import { useAddCommunityDialog } from '../../providers'
import { AddCommunityDialogContent, CreateCommunityDialogContent, JoinCommunityDialog } from './components'

const screens: Record<AddCommunityDialogScreen, ReactNode> = {
  add: <AddCommunityDialogContent />,
  join: <JoinCommunityDialog />,
  create: <CreateCommunityDialogContent />,
}

interface AddCommunityDialogProps {
  ref: RefObject<HTMLDivElement | null>
}

export function AddCommunityDialog({ ref }: AddCommunityDialogProps) {
  const { dialog, screen } = useAddCommunityDialog()

  return (
    <Dialog open={dialog.opened} onOpenChange={dialog.toggle}>
      <DialogTrigger
        render={props => (
          <div ref={ref}>
            <Button
              {...props}
              size="icon-lg"
              variant="outline"
              className="rounded-md"
            >
              <PlusIcon />
            </Button>
          </div>
        )}
      />
      <DialogContent>
        {screens[screen]}
      </DialogContent>
    </Dialog>
  )
}
