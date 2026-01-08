import { createFileRoute, Link, redirect } from '@tanstack/react-router'

import { GoogleOauth } from '@/components/auth/google-oauth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { I18nText } from '@/i18n/components/i18n-text'

import { useLoginPage } from './-hooks/use-login-page'

export const Route = createFileRoute('/login/')({
  component: LoginPage,
  beforeLoad: ({ context }) => {
    if (context.user)
      throw redirect({ to: '/' })
  },
})

function LoginPage() {
  const { i18n, form, mutations } = useLoginPage()

  return (
    <Card className="absolute left-1/2 top-1/2 w-xs -translate-x-1/2 -translate-y-1/2">
      <CardHeader>
        <CardTitle>
          <I18nText id="form.login.title" />
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
              <I18nText id="form.login.title" />
            </FieldLegend>

            <FieldGroup>
              <form.AppField name="identity">
                {field => (
                  <field.Input
                    label={i18n.t('field.identity.label')}
                    description={i18n.t('field.identity.description')}
                    error={i18n.t(field.state.meta.errors)}
                    autoComplete="username"
                  />
                )}
              </form.AppField>

              <form.AppField name="password">
                {field => (
                  <field.Input
                    label={i18n.t('field.password.label')}
                    description={i18n.t('field.password.description')}
                    type="password"
                    error={i18n.t(field.state.meta.errors)}
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
            <I18nText id="text.forgot-password" />
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
          <I18nText id="text.don-not-have-an-account" />
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

        <FieldSeparator className="my-1">
          <I18nText id="text.or-continue-with" />
        </FieldSeparator>

        <GoogleOauth />
      </CardFooter>
    </Card>
  )
}
