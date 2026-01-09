import { useBoolean } from '@/hooks/use-boolean'

export function useAddCommunityDialog() {
  const [createCommunityDialogOpen, setCreateCommunityDialogOpen] = useBoolean(false)
  const [joinCommunityDialogOpen, setJoinCommunityDialogOpen] = useBoolean(false)

  return {
    state: {
      createCommunityDialogOpen,
      joinCommunityDialogOpen,
    },
    functions: {
      setCreateCommunityDialogOpen,
      setJoinCommunityDialogOpen,
    },
  }
}
