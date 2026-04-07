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

import { useResetPasswordPage } from './-hooks'

const ResetPasswordSearchSchema = z.object({
  token: z.preprocess(
    value => typeof value === 'string' && value.trim().length > 0 ? value : undefined,
    z.string().optional(),
  ),
})

export const Route = createFileRoute('/(auth)/reset-password/')({
  validateSearch: ResetPasswordSearchSchema,
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token } = Route.useSearch()
  const { features, form, mutations, state } = useResetPasswordPage(token)

  if (!state.token) {
    return (
      <Card
        className="
          absolute top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-1/2
        "
      >
        <CardHeader>
          <CardTitle>
            <I18nText id="auth.reset-password.invalid.title" />
          </CardTitle>
          <CardDescription>
            <I18nText id="auth.reset-password.invalid.description" />
          </CardDescription>
        </CardHeader>

        <CardFooter>
          <Link
            to="/recovery"
            className={buttonVariants({ className: 'w-full' })}
          >
            <I18nText id="auth.reset-password.request-new-link" />
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
          <I18nText id="auth.reset-password.title" />
        </CardTitle>
        <CardDescription>
          <I18nText id="auth.reset-password.description" />
        </CardDescription>
      </CardHeader>

      <form
        id="reset-password-form"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <CardContent>
          <FieldSet>
            <FieldLegend className="sr-only">
              <I18nText id="auth.reset-password.title" />
            </FieldLegend>

            <FieldGroup>
              <form.AppField name="newPassword">
                {field => (
                  <field.Input
                    type="password"
                    label={features.i18n.t('input.password.label')}
                    description={features.i18n.t('input.password.hint')}
                    error={features.i18n.t(field.state.meta.errors)}
                    autoComplete="new-password"
                  />
                )}
              </form.AppField>

              <form.AppField name="confirmPassword">
                {field => (
                  <field.Input
                    type="password"
                    label={features.i18n.t('input.password-confirm.label')}
                    error={features.i18n.t(field.state.meta.errors)}
                    autoComplete="new-password"
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </form>

      <CardFooter className="flex flex-col gap-2">
        {mutations.resetPassword.isError && (
          <Typography
            variant="caption"
            className="text-center text-destructive"
          >
            <I18nText id="auth.reset-password.error" />
          </Typography>
        )}

        <form.Subscribe selector={formState => formState.isSubmitting}>
          {isSubmitting => (
            <Button
              type="submit"
              className="w-full"
              form="reset-password-form"
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              <I18nText id="auth.reset-password.submit" />
            </Button>
          )}
        </form.Subscribe>

        <Link
          to="/recovery"
          className={buttonVariants({ variant: 'outline', className: 'w-full' })}
        >
          <I18nText id="auth.reset-password.request-new-link" />
        </Link>
      </CardFooter>
    </Card>
  )
}
