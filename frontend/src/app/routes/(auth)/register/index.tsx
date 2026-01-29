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
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import { Typography } from '@/components/ui/typography.tsx'

import { GoogleOauth } from '../-components'
import { useRegisterPage } from './-hooks'

export const Route = createFileRoute('/(auth)/register/')({
  component: RegisterPage,
  beforeLoad: ({ context }) => {
    if (context.user)
      throw redirect({ to: '/' })
  },
})

function RegisterPage() {
  const { form, mutations, features } = useRegisterPage()

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
          form.handleSubmit()
        }}
      >
        <CardContent>
          <FieldSet>
            <FieldLegend className="sr-only">
              <I18nText id="form.register.title" />
            </FieldLegend>

            <FieldGroup>
              <form.AppField name="username">
                {field => (
                  <field.Input
                    label={features.i18n.t('field.username.label')}
                    description={features.i18n.t('field.username.description')}
                    error={features.i18n.t(field.state.meta.errors)}
                    autoComplete="username"
                  />
                )}
              </form.AppField>

              <form.AppField name="email">
                {field => (
                  <field.Input
                    label={features.i18n.t('field.email.label')}
                    error={features.i18n.t(field.state.meta.errors)}
                    type="email"
                    autoComplete="email"
                  />
                )}
              </form.AppField>

              <form.AppField name="password">
                {field => (
                  <field.Input
                    label={features.i18n.t('field.password.label')}
                    description={features.i18n.t('field.password.description')}
                    error={features.i18n.t(field.state.meta.errors)}
                    type="password"
                    autoComplete="new-password"
                  />
                )}
              </form.AppField>

              <form.AppField name="confirmPassword">
                {field => (
                  <field.Input
                    label={features.i18n.t('field.confirm-password.label')}
                    error={features.i18n.t(field.state.meta.errors)}
                    type="password"
                    autoComplete="current-password"
                  />
                )}
              </form.AppField>
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
          disabled={mutations.register.isPending}
        >
          {mutations.register.isPending && <Spinner />}
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
