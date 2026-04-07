import { createFileRoute } from '@tanstack/react-router'

import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'

import { useProfilePage } from './-hooks/use-profile-page'

export const Route = createFileRoute('/(layout)/_layout/profile/')({
  component: ProfilePage,
  head: () => ({
    meta: [{ title: 'Hive | Profile' }],
  }),
})

function ProfilePage() {
  const { features, forms, functions, mutations, state } = useProfilePage()

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-scroll p-8 pb-128">
      <div>
        <Typography variant="heading">
          <I18nText id="dropdown.account.profile" />
        </Typography>
        <Typography variant="caption">
          <I18nText id="profile.page.caption" />
        </Typography>
      </div>

      <Separator />

      <div>
        <Typography variant="subheading">
          <I18nText id="profile.info.title" />
        </Typography>
        <Typography variant="caption">
          <I18nText id="profile.info.caption" />
        </Typography>

        <form
          id="profile-form"
          className="mt-4 max-w-md"
          onSubmit={(e) => {
            e.preventDefault()
            forms.profile.handleSubmit()
          }}
        >
          <FieldSet>
            <FieldLegend className="sr-only">
              <I18nText id="profile.info.title" />
            </FieldLegend>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="profile-email">
                  <I18nText id="input.email.label" />
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="profile-email"
                    type="email"
                    value={state.user?.email}
                    readOnly
                    disabled
                  />
                  <FieldDescription>
                    <I18nText id="profile.info.email.caption" />
                  </FieldDescription>
                </FieldContent>
              </Field>

              {!state.user?.emailConfirmed && (
                <Field>
                  <FieldContent>
                    <FieldDescription>
                      <I18nText id="profile.info.email-unconfirmed.description" />
                    </FieldDescription>

                    {mutations.resendConfirmation.isSuccess && (
                      <FieldDescription>
                        <I18nText id="profile.info.email-unconfirmed.success" />
                      </FieldDescription>
                    )}
                  </FieldContent>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={functions.onResendConfirmation}
                    disabled={mutations.resendConfirmation.isPending}
                  >
                    {mutations.resendConfirmation.isPending && <Spinner />}
                    <I18nText id="profile.info.email-unconfirmed.action" />
                  </Button>
                </Field>
              )}

              <forms.profile.AppField name="name">
                {field => (
                  <field.Input
                    label={features.i18n.t('input.name.label')}
                    error={features.i18n.t(field.state.meta.errors)}
                    autoComplete="name"
                  />
                )}
              </forms.profile.AppField>

              <forms.profile.AppField name="username">
                {field => (
                  <field.Input
                    label={features.i18n.t('input.username.label')}
                    description={features.i18n.t('input.username.hint')}
                    error={features.i18n.t(field.state.meta.errors)}
                    autoComplete="username"
                  />
                )}
              </forms.profile.AppField>
            </FieldGroup>
          </FieldSet>
        </form>

        <forms.profile.Subscribe selector={formState => formState.isSubmitting}>
          {isSubmitting => (
            <Button
              className="mt-4"
              type="submit"
              form="profile-form"
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              <I18nText id="profile.info.submit" />
            </Button>
          )}
        </forms.profile.Subscribe>
      </div>

      <Separator />

      <div>
        <Typography variant="subheading">
          <I18nText id="profile.security.title" />
        </Typography>
        <Typography variant="caption">
          <I18nText id="profile.security.caption" />
        </Typography>

        <div className="mt-4 max-w-md">
          <Field>
            <FieldContent>
              <FieldDescription>
                <I18nText id="profile.security.password-setup.description" />
              </FieldDescription>

              {mutations.requestReset.isSuccess && (
                <FieldDescription>
                  <I18nText id="profile.security.password-setup.success" />
                </FieldDescription>
              )}
            </FieldContent>

            <Button
              type="button"
              variant="outline"
              onClick={functions.onSendPasswordSetupLink}
              disabled={mutations.requestReset.isPending}
            >
              {mutations.requestReset.isPending && <Spinner />}
              <I18nText id="profile.security.password-setup.action" />
            </Button>
          </Field>
        </div>

        <form
          id="change-password-form"
          className="mt-4 max-w-md"
          onSubmit={(e) => {
            e.preventDefault()
            forms.password.handleSubmit()
          }}
        >
          <FieldSet>
            <FieldLegend className="sr-only">
              <I18nText id="profile.security.title" />
            </FieldLegend>

            <FieldGroup>
              <forms.password.AppField name="currentPassword">
                {field => (
                  <field.Input
                    type="password"
                    label={features.i18n.t('input.current-password.label')}
                    description={features.i18n.t('input.password.hint')}
                    error={features.i18n.t(field.state.meta.errors)}
                    autoComplete="current-password"
                  />
                )}
              </forms.password.AppField>

              <forms.password.AppField name="newPassword">
                {field => (
                  <field.Input
                    type="password"
                    label={features.i18n.t('input.new-password.label')}
                    description={features.i18n.t('input.password.hint')}
                    error={features.i18n.t(field.state.meta.errors)}
                    autoComplete="new-password"
                  />
                )}
              </forms.password.AppField>

              <forms.password.AppField name="confirmPassword">
                {field => (
                  <field.Input
                    type="password"
                    label={features.i18n.t('input.password-confirm.label')}
                    error={features.i18n.t(field.state.meta.errors)}
                    autoComplete="new-password"
                  />
                )}
              </forms.password.AppField>
            </FieldGroup>
          </FieldSet>
        </form>

        <forms.password.Subscribe selector={formState => formState.isSubmitting}>
          {isSubmitting => (
            <Button
              className="mt-4"
              type="submit"
              form="change-password-form"
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              <I18nText id="profile.security.submit" />
            </Button>
          )}
        </forms.password.Subscribe>
      </div>
    </div>
  )
}
