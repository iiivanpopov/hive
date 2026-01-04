import { createFileRoute, Link, redirect } from '@tanstack/react-router'

import { GoogleOauth } from '@/components/auth/google-oauth'
import { I18nText } from '@/components/i18n/i18n-text'
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

import { useRoute } from './-use-route'

export const Route = createFileRoute('/(auth)/login/')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.user)
      throw redirect({ to: '/' })
  },
})

export function RouteComponent() {
  const { loginForm, loginMutation, i18n } = useRoute()

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
          loginForm.handleSubmit()
        }}
      >
        <CardContent>
          <FieldSet>
            <FieldLegend className="sr-only">
              <I18nText id="form.login.title" />
            </FieldLegend>

            <FieldGroup>
              <loginForm.AppField name="identity">
                {field => (
                  <field.Input
                    label={i18n.t('field.identity.label')}
                    description={i18n.t('field.identity.description')}
                    error={i18n.t(field.state.meta.errors)}
                    autoComplete="username"
                  />
                )}
              </loginForm.AppField>

              <loginForm.AppField name="password">
                {field => (
                  <field.Input
                    label={i18n.t('field.password.label')}
                    description={i18n.t('field.password.description')}
                    type="password"
                    error={i18n.t(field.state.meta.errors)}
                    autoComplete="current-password"
                  />
                )}
              </loginForm.AppField>
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </form>

      <CardFooter className="flex flex-col gap-2">
        {loginMutation.isError && (
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
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending && <Spinner />}
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
