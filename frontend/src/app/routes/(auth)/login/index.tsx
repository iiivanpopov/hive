import { createFileRoute, Link, redirect } from '@tanstack/react-router'

import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
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

import { GoogleOauth } from '../-components'
import { useLoginPage } from './-hooks'

export const Route = createFileRoute('/(auth)/login/')({
  component: LoginPage,
  beforeLoad: ({ context }) => {
    if (context.user)
      throw redirect({ to: '/' })
  },
})

function LoginPage() {
  const { form, mutations, features } = useLoginPage()

  return (
    <Card className="absolute left-1/2 top-1/2 w-xs -translate-x-1/2 -translate-y-1/2">
      <CardHeader>
        <CardTitle>
          <I18nText id="auth.login.title" />
        </CardTitle>
      </CardHeader>

      <form
        id="login-form"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <CardContent>
          <FieldSet>
            <FieldLegend className="sr-only">
              <I18nText id="auth.login.title" />
            </FieldLegend>

            <FieldGroup>
              <form.AppField name="identity">
                {field => (
                  <field.Input
                    label={features.i18n.t('input.username-or-email.label')}
                    description={features.i18n.t('input.username-or-email.hint')}
                    error={features.i18n.t(field.state.meta.errors)}
                    autoComplete="username"
                  />
                )}
              </form.AppField>

              <form.AppField name="password">
                {field => (
                  <field.Input
                    type="password"
                    label={features.i18n.t('input.password.label')}
                    description={features.i18n.t('input.password.hint')}
                    error={features.i18n.t(field.state.meta.errors)}
                    autoComplete="current-password"
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </form>

      <CardFooter className="flex flex-col gap-2">
        {mutations.login.isError && (
          <Typography
            variant="caption"
            className="text-center mb-4"
          >
            <I18nText id="auth.forgot-password" />
            {' '}
            <Link
              to="/recovery"
              className="text-primary underline"
            >
              <I18nText id="link.recover" />
            </Link>
          </Typography>
        )}

        <Typography
          variant="caption"
          className="text-center"
        >
          <I18nText id="auth.no-account" />
          {' '}
          <Link
            to="/register"
            className="text-primary underline"
          >
            <I18nText id="link.sign-up" />
          </Link>
        </Typography>

        <Button
          type="submit"
          className="w-full"
          form="login-form"
          disabled={mutations.login.isPending}
        >
          {mutations.login.isPending && <Spinner />}
          <I18nText id="button.submit" />
        </Button>

        <span className="text-muted-foreground my-1">
          <I18nText id="auth.continue-with" />
        </span>

        <GoogleOauth />
      </CardFooter>
    </Card>
  )
}
