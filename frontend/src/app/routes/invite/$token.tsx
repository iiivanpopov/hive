import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import z from 'zod'

import type { PostCommunitiesJoinTokenResponse } from '@/api/types.gen'

import { getCommunitiesJoinedOptions } from '@/api/@tanstack/react-query.gen'
import { postCommunitiesJoinToken } from '@/api/sdk.gen'
import { I18nText } from '@/components/i18n'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { queryClient } from '@/lib/query-client'

import { useInvitePage } from './-hooks/use-invite-page'

const InviteRouteParamsSchema = z.object({
  token: z.string().trim().min(1),
})

export const Route = createFileRoute('/invite/$token')({
  component: InvitePage,
  params: InviteRouteParamsSchema,
  pendingComponent: InvitePendingPage,
  beforeLoad: async ({ context, params: { token } }) => {
    if (!context.user)
      return { joinCommunityError: false }

    const communityId = await postCommunitiesJoinToken({
      path: { token },
      responseStyle: 'data',
      throwOnError: true,
      meta: { toast: false },
    })
      .then(response => (response as unknown as PostCommunitiesJoinTokenResponse).community.id)
      .catch(() => null)

    if (communityId === null)
      return { joinCommunityError: true }

    await queryClient.invalidateQueries(getCommunitiesJoinedOptions())

    throw redirect({
      to: '/c/$communityId',
      params: { communityId },
    })
  },
})

function InvitePage() {
  const { functions, state } = useInvitePage()

  if (!state.user) {
    return (
      <Card
        className="
          absolute top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-1/2
        "
      >
        <CardHeader>
          <CardTitle>
            <I18nText id="invite.page.title" />
          </CardTitle>
          <CardDescription>
            <I18nText id="invite.page.description" />
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col gap-2">
          <Link
            to="/login"
            search={() => ({ redirectTo: state.redirectTo })}
            className={buttonVariants({ className: 'w-full' })}
          >
            <I18nText id="invite.page.login" />
          </Link>

          <Link
            to="/register"
            search={() => ({ redirectTo: state.redirectTo })}
            className={buttonVariants({ variant: 'outline', className: 'w-full' })}
          >
            <I18nText id="invite.page.register" />
          </Link>
        </CardFooter>
      </Card>
    )
  }

  if (state.joinCommunityError) {
    return (
      <Card
        className="
          absolute top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-1/2
        "
      >
        <CardHeader>
          <CardTitle>
            <I18nText id="invite.page.error.title" />
          </CardTitle>
          <CardDescription>
            <I18nText id="invite.page.error.description" />
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col gap-2">
          <Button
            type="button"
            className="w-full"
            onClick={functions.onRetry}
          >
            <I18nText id="invite.page.retry" />
          </Button>

          <Link
            to="/"
            className={buttonVariants({ variant: 'outline', className: 'w-full' })}
          >
            <I18nText id="invite.page.go-home" />
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card
      className="
        absolute top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-1/2
      "
    >
      <CardHeader>
        <CardTitle>
          <I18nText id="invite.page.pending.title" />
        </CardTitle>
        <CardDescription>
          <I18nText id="invite.page.pending.description" />
        </CardDescription>
      </CardHeader>

      <CardFooter>
        <div className={buttonVariants({ variant: 'outline', className: 'w-full cursor-default' })}>
          <Spinner />
          <I18nText id="invite.page.pending.action" />
        </div>
      </CardFooter>
    </Card>
  )
}

function InvitePendingPage() {
  return (
    <Card
      className="
        absolute top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-1/2
      "
    >
      <CardHeader>
        <CardTitle>
          <I18nText id="invite.page.pending.title" />
        </CardTitle>
        <CardDescription>
          <I18nText id="invite.page.pending.description" />
        </CardDescription>
      </CardHeader>

      <CardFooter>
        <div className={buttonVariants({ variant: 'outline', className: 'w-full cursor-default' })}>
          <Spinner />
          <I18nText id="invite.page.pending.action" />
        </div>
      </CardFooter>
    </Card>
  )
}
