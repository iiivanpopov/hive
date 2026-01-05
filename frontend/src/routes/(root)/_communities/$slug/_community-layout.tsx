import { useMutation, useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { ChevronDownIcon, DoorOpenIcon, GlobeIcon } from 'lucide-react'

import { getAuthMeOptions, getCommunitiesIdOptions, getCommunitiesJoinedQueryKey, postCommunitiesLeaveIdMutation } from '@/api/@tanstack/react-query.gen'
import { I18nText } from '@/components/i18n/i18n-text'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
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
      <div className="w-48 bg-zinc-100 py-4">
        <div className="py-2 border-l-[1.5px] border-b-[1.5px] border-t-[1.5px] rounded-tl-md rounded-bl-md h-full border-border flex flex-col gap-2">
          <DropdownMenu
            open={isCommunityDropdownMenuOpen}
            onOpenChange={setIsCommunityDropdownMenuOpen}
          >
            <DropdownMenuTrigger className="flex gap-2 cursor-pointer hover:bg-zinc-200 transition-colors px-2 mx-2 py-1 rounded-sm items-center max-w-44 justify-between">
              <div className="flex gap-2 items-center truncate">
                <GlobeIcon size={20} className="shrink-0" />
                <Typography className="font-bold truncate text-secondary-foreground">
                  {communityQuery.data.community.name}
                </Typography>
              </div>
              <ChevronDownIcon
                data-open={isCommunityDropdownMenuOpen}
                size={20}
                className="data-open:rotate-180 rotate-0 transition-transform text-secondary-foreground shrink-0"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 ">
              <DropdownMenuGroup>
                <DropdownMenuItem className="wrap-anywhere">
                  {communityQuery.data.community.name}
                </DropdownMenuItem>

                {!isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLeaveCommunity}
                      className="text-destructive"
                    >
                      <DoorOpenIcon size={20} />
                      <I18nText id="button.leave-community" />
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator />
        </div>
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
