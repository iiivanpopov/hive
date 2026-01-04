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

import { useLoginPage } from './-use-login-page'

export function LoginPage() {
  const { loginForm, loginMutation } = useLoginPage()
  const { t } = useI18n()

  return (
    <Card className="absolute left-1/2 top-1/2 w-xs -translate-x-1/2 -translate-y-1/2">
      <CardHeader>
        <CardTitle>
          <I18nText id="form.auth.title" />
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
              <I18nText id="form.auth.title" />
            </FieldLegend>

            <FieldGroup>
              <loginForm.AppField name="identity">
                {field => (
                  <field.Input
                    label={t('field.identity.label')}
                    description={t('field.identity.description')}
                    error={t(field.state.meta.errors)}
                    autoComplete="username"
                  />
                )}
              </loginForm.AppField>

              <loginForm.AppField name="password">
                {field => (
                  <field.Input
                    label={t('field.password.label')}
                    type="password"
                    error={t(field.state.meta.errors)}
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
              to="/auth/recovery"
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
            to="/auth/register"
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
