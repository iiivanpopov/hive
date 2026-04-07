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
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'
import { Typography } from '@/components/ui/typography.tsx'

import { GoogleOauth } from '../-components'
import { useRegisterPage } from './-hooks'

const RegisterSearchSchema = z.object({
  redirectTo: z.preprocess(
    value => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
      ? value
      : undefined,
    z.string().optional(),
  ),
})

export const Route = createFileRoute('/(auth)/register/')({
  validateSearch: RegisterSearchSchema,
  component: RegisterPage,
  beforeLoad: ({ context, search }) => {
    if (context.user)
      throw redirect({ href: search.redirectTo ?? '/' })
  },
})

function RegisterPage() {
  const { form, features, state } = useRegisterPage()

  return (
    <Card className="absolute top-1/2 left-1/2 w-xs -translate-1/2">
      <CardHeader>
        <CardTitle>
          <I18nText id="auth.register.title" />
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
              <I18nText id="auth.register.title" />
            </FieldLegend>

            <FieldGroup>
              <form.AppField name="username">
                {field => (
                  <field.Input
                    label={features.i18n.t('input.username.label')}
                    description={features.i18n.t('input.username.hint')}
                    error={features.i18n.t(field.state.meta.errors)}
                    autoComplete="username"
                  />
                )}
              </form.AppField>

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

              <form.AppField name="password">
                {field => (
                  <field.Input
                    label={features.i18n.t('input.password.label')}
                    description={features.i18n.t('input.password.hint')}
                    error={features.i18n.t(field.state.meta.errors)}
                    type="password"
                    autoComplete="new-password"
                  />
                )}
              </form.AppField>

              <form.AppField name="confirmPassword">
                {field => (
                  <field.Input
                    label={features.i18n.t('input.password-confirm.label')}
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
          <I18nText id="auth.have-account" />
          {' '}
          <Link
            to="/login"
            search={() => ({ redirectTo: state.redirectTo })}
            className="text-primary underline"
          >
            <I18nText id="link.sign-in" />
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

        <FieldSeparator className="my-1">
          <I18nText id="auth.continue-with" />
        </FieldSeparator>

        <GoogleOauth />
      </CardFooter>
    </Card>
  )
}
