import { createFileRoute, Link } from '@tanstack/react-router'
import z from 'zod'

import { I18nText } from '@/components/i18n'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import {
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import { Typography } from '@/components/ui/typography.tsx'

import { useConfirmEmailPage } from './-hooks'

const ConfirmEmailSearchSchema = z.object({
  token: z.preprocess(
    value => typeof value === 'string' && value.trim().length > 0 ? value : undefined,
    z.string().optional(),
  ),
})

export const Route = createFileRoute('/(auth)/confirm-email/')({
  validateSearch: ConfirmEmailSearchSchema,
  component: ConfirmEmailPage,
})

function ConfirmEmailPage() {
  const { features, form, functions, mutations, state } = useConfirmEmailPage()

  if (state.status === 'idle') {
    return (
      <Card
        className="
          absolute top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-1/2
        "
      >
        <CardHeader>
          <CardTitle>
            <I18nText id="auth.confirm-email.title" />
          </CardTitle>
          <CardDescription>
            <I18nText id="auth.confirm-email.idle.description" />
          </CardDescription>
        </CardHeader>

        <CardFooter>
          <Button
            type="button"
            className="w-full"
            onClick={functions.onConfirmEmail}
          >
            <I18nText id="auth.confirm-email.submit" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (state.status === 'pending') {
    return (
      <Card
        className="
          absolute top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-1/2
        "
      >
        <CardHeader>
          <CardTitle>
            <I18nText id="auth.confirm-email.pending.title" />
          </CardTitle>
          <CardDescription>
            <I18nText id="auth.confirm-email.pending.description" />
          </CardDescription>
        </CardHeader>

        <CardFooter>
          <div className={buttonVariants({ variant: 'outline', className: 'w-full cursor-default' })}>
            <Spinner />
            <I18nText id="auth.confirm-email.title" />
          </div>
        </CardFooter>
      </Card>
    )
  }

  if (state.status === 'success') {
    return (
      <Card
        className="
          absolute top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-1/2
        "
      >
        <CardHeader>
          <CardTitle>
            <I18nText id="auth.confirm-email.success.title" />
          </CardTitle>
          <CardDescription>
            <I18nText id="auth.confirm-email.success.description" />
          </CardDescription>
        </CardHeader>

        <CardFooter>
          <Link
            to={state.user ? '/' : '/login'}
            className={buttonVariants({ className: 'w-full' })}
          >
            <I18nText id={state.user ? 'auth.confirm-email.go-home' : 'auth.confirm-email.go-login'} />
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
          <I18nText id="auth.confirm-email.error.title" />
        </CardTitle>
        <CardDescription>
          <I18nText id="auth.confirm-email.error.description" />
        </CardDescription>
      </CardHeader>

      <form
        id="confirm-email-resend-form"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <CardContent>
          <FieldSet>
            <FieldLegend>
              <I18nText id="auth.confirm-email.resend.title" />
            </FieldLegend>

            <Typography
              variant="caption"
              className="mb-6"
            >
              <I18nText id="auth.confirm-email.resend.description" />
            </Typography>

            <FieldGroup>
              <form.AppField name="email">
                {field => (
                  <field.Input
                    label={features.i18n.t('input.email.label')}
                    error={features.i18n.t(field.state.meta.errors)}
                    type="email"
                    autoComplete="email"
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </form>

      <CardFooter className="flex flex-col gap-2">
        {mutations.resendConfirmation.isSuccess && (
          <Typography
            variant="caption"
            className="text-center"
          >
            <I18nText id="auth.confirm-email.resend.success" />
          </Typography>
        )}

        <form.Subscribe selector={formState => formState.isSubmitting}>
          {isSubmitting => (
            <Button
              type="submit"
              className="w-full"
              form="confirm-email-resend-form"
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              <I18nText id="auth.confirm-email.resend.submit" />
            </Button>
          )}
        </form.Subscribe>

        <Link
          to="/login"
          search={() => ({ redirectTo: undefined })}
          className={buttonVariants({ variant: 'outline', className: 'w-full' })}
        >
          <I18nText id="auth.confirm-email.go-login" />
        </Link>
      </CardFooter>
    </Card>
  )
}
