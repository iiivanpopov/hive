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

export const Route = createFileRoute('/(auth)/register/')({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.user)
      throw redirect({ to: '/' })
  },
})

export function RouteComponent() {
  const { registerForm, registerMutation, i18n } = useRoute()

  return (
    <Card className="absolute left-1/2 top-1/2 w-xs -translate-x-1/2 -translate-y-1/2">
      <CardHeader>
        <CardTitle>
          <I18nText id="form.register.title" />
        </CardTitle>
      </CardHeader>

      <form
        id="login-form"
        onSubmit={(e) => {
          e.preventDefault()
          registerForm.handleSubmit()
        }}
      >
        <CardContent>
          <FieldSet>
            <FieldLegend className="sr-only">
              <I18nText id="form.register.title" />
            </FieldLegend>

            <FieldGroup>
              <registerForm.AppField name="username">
                {field => (
                  <field.Input
                    label={i18n.t('field.username.label')}
                    description={i18n.t('field.username.description')}
                    error={i18n.t(field.state.meta.errors)}
                    autoComplete="username"
                  />
                )}
              </registerForm.AppField>

              <registerForm.AppField name="email">
                {field => (
                  <field.Input
                    label={i18n.t('field.email.label')}
                    type="email"
                    error={i18n.t(field.state.meta.errors)}
                    autoComplete="email"
                  />
                )}
              </registerForm.AppField>

              <registerForm.AppField name="password">
                {field => (
                  <field.Input
                    label={i18n.t('field.password.label')}
                    type="password"
                    description={i18n.t('field.password.description')}
                    error={i18n.t(field.state.meta.errors)}
                    autoComplete="new-password"
                  />
                )}
              </registerForm.AppField>

              <registerForm.AppField name="confirmPassword">
                {field => (
                  <field.Input
                    label={i18n.t('field.confirm-password.label')}
                    type="password"
                    error={i18n.t(field.state.meta.errors)}
                    autoComplete="current-password"
                  />
                )}
              </registerForm.AppField>
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </form>

      <CardFooter className="flex flex-col gap-2">
        <Typography
          variant="caption"
          className="text-center"
        >
          <I18nText id="text.have-an-account" />
          {' '}
          <Link
            to="/login"
            className="text-primary underline"
          >
            <I18nText id="link.sign-in" />
          </Link>
        </Typography>

        <Button
          type="submit"
          className="w-full"
          form="login-form"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending && <Spinner />}
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
