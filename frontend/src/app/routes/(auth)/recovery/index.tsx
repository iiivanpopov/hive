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

import { useRecoveryPage } from './-hooks'

const RecoverySearchSchema = z.object({
  redirectTo: z.preprocess(
    value => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
      ? value
      : undefined,
    z.string().optional(),
  ),
})

export const Route = createFileRoute('/(auth)/recovery/')({
  validateSearch: RecoverySearchSchema,
  component: RecoveryPage,
})

function RecoveryPage() {
  const { features, form, state } = useRecoveryPage()

  if (state.hasRequestedReset) {
    return (
      <Card
        className="
          absolute top-1/2 left-1/2 w-[calc(100%-2rem)] max-w-sm -translate-1/2
        "
      >
        <CardHeader>
          <CardTitle>
            <I18nText id="auth.recovery.success.title" />
          </CardTitle>
          <CardDescription>
            <I18nText id="auth.recovery.success.description" />
          </CardDescription>
        </CardHeader>

        <CardFooter>
          <Link
            to="/login"
            search={() => ({ redirectTo: state.redirectTo })}
            className={buttonVariants({ className: 'w-full' })}
          >
            <I18nText id="auth.recovery.back-to-login" />
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
          <I18nText id="auth.recovery.title" />
        </CardTitle>
        <CardDescription>
          <I18nText id="auth.recovery.description" />
        </CardDescription>
      </CardHeader>

      <form
        id="recovery-form"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <CardContent>
          <FieldSet>
            <FieldLegend className="sr-only">
              <I18nText id="auth.recovery.title" />
            </FieldLegend>

            <FieldGroup>
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
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </form>

      <CardFooter className="flex flex-col gap-2">
        <form.Subscribe selector={formState => formState.isSubmitting}>
          {isSubmitting => (
            <Button
              type="submit"
              className="w-full"
              form="recovery-form"
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              <I18nText id="auth.recovery.submit" />
            </Button>
          )}
        </form.Subscribe>

        <Link
          to="/login"
          search={() => ({ redirectTo: state.redirectTo })}
          className={buttonVariants({ variant: 'outline', className: 'w-full' })}
        >
          <I18nText id="auth.recovery.back-to-login" />
        </Link>
      </CardFooter>
    </Card>
  )
}
