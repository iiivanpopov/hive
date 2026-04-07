import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import z from 'zod'

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

const LoginSearchSchema = z.object({
  redirectTo: z.preprocess(
    value => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
      ? value
      : undefined,
    z.string().optional(),
  ),
})

export const Route = createFileRoute('/(auth)/login/')({
  validateSearch: LoginSearchSchema,
  component: LoginPage,
  beforeLoad: ({ context, search }) => {
    if (context.user)
      throw redirect({ href: search.redirectTo ?? '/' })
  },
})

function LoginPage() {
  const { form, mutations, features, state } = useLoginPage()

  return (
    <Card className="absolute top-1/2 left-1/2 w-xs -translate-1/2">
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
            className="mb-4 text-center"
          >
            <I18nText id="auth.forgot-password" />
            {' '}
            <Link
              to="/recovery"
              search={() => ({ redirectTo: state.redirectTo })}
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
            search={() => ({ redirectTo: state.redirectTo })}
            className="text-primary underline"
          >
            <I18nText id="link.sign-up" />
          </Link>
        </Typography>

        <form.Subscribe selector={state => state.isSubmitting}>
          {isSubmitting => (
            <Button
              type="submit"
              className="w-full"
              form="login-form"
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              <I18nText id="button.submit" />
            </Button>
          )}
        </form.Subscribe>

        <span className="my-1 text-muted-foreground">
          <I18nText id="auth.continue-with" />
        </span>

        <GoogleOauth />
      </CardFooter>
    </Card>
  )
}
