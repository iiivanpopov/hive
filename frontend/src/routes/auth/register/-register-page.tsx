import { Link } from '@tanstack/react-router'

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
import { useI18n } from '@/providers/i18n-provider'

import { useRegisterPage } from './-use-register-page'

export function RegisterPage() {
  const { registerForm, registerMutation } = useRegisterPage()
  const { t } = useI18n()

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
                    label={t('field.username.label')}
                    description={t('field.username.description')}
                    error={t(field.state.meta.errors)}
                    autoComplete="username"
                  />
                )}
              </registerForm.AppField>

              <registerForm.AppField name="email">
                {field => (
                  <field.Input
                    label={t('field.email.label')}
                    type="email"
                    error={t(field.state.meta.errors)}
                    autoComplete="email"
                  />
                )}
              </registerForm.AppField>

              <registerForm.AppField name="password">
                {field => (
                  <field.Input
                    label={t('field.password.label')}
                    type="password"
                    description={t('field.password.description')}
                    error={t(field.state.meta.errors)}
                    autoComplete="new-password"
                  />
                )}
              </registerForm.AppField>

              <registerForm.AppField name="confirmPassword">
                {field => (
                  <field.Input
                    label={t('field.confirm-password.label')}
                    type="password"
                    error={t(field.state.meta.errors)}
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
            to="/auth/login"
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
