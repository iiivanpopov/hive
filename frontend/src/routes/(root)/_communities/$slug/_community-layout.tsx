import { useMutation, useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { ChevronDownIcon, DoorOpenIcon } from 'lucide-react'

import { getAuthMeOptions, getCommunitiesIdOptions, getCommunitiesJoinedQueryKey, postCommunitiesLeaveIdMutation } from '@/api/@tanstack/react-query.gen'
import { I18nText } from '@/components/i18n/i18n-text'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Typography } from '@/components/ui/typography'
import { useBoolean } from '@/hooks/use-boolean'
import { queryClient } from '@/providers/query-provider'

export const Route = createFileRoute('/(root)/_communities/$slug/_community-layout')({
  component: RouteComponent,
  loader: async ({ params }) => queryClient.ensureQueryData(getCommunitiesIdOptions({
    path: {
      id: params.slug,
    },
  })),
})

function RouteComponent() {
  const params = Route.useParams()
  const navigate = useNavigate()

  const [communityQuery, authMeQuery] = useSuspenseQueries({
    queries: [
      getCommunitiesIdOptions({
        path: {
          id: params.slug,
        },
      }),
      getAuthMeOptions(),
    ],
  })

  const leaveMutation = useMutation(postCommunitiesLeaveIdMutation())

  const [isCommunityDropdownMenuOpen, setIsCommunityDropdownMenuOpen] = useBoolean(false)

  const handleLeaveCommunity = async () => {
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

  const isOwner = communityQuery.data.community.ownerId === authMeQuery.data.user.id

  return (
    <div className="flex flex-1">
      <div className="w-48 bg-zinc-100 py-6 px-2">
        <DropdownMenu
          open={isCommunityDropdownMenuOpen}
          onOpenChange={setIsCommunityDropdownMenuOpen}
        >
          <DropdownMenuTrigger className="flex gap-2 cursor-pointer hover:bg-zinc-200 transition-colors px-2 py-1 rounded-sm items-center max-w-44">
            <Typography className="font-bold truncate text-secondary-foreground">
              {communityQuery.data.community.name}
            </Typography>
            <ChevronDownIcon
              data-open={isCommunityDropdownMenuOpen}
              size={20}
              className="data-open:rotate-180 rotate-0 transition-transform text-secondary-foreground"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 ">
            {!isOwner && (
              <DropdownMenuItem onClick={handleLeaveCommunity}>
                <DoorOpenIcon size={20} className="text-destructive" />
                <span className="text-destructive">
                  <I18nText id="button.leave-community" />
                </span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1">
        <Outlet />
      </div>

      <div className="w-48 bg-zinc-100 py-6 px-2">
        MEMBERS
      </div>
    </div>
  )
}
