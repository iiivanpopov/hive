import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'

import { useCreateInvitationScreen } from './hooks/use-create-invitation-screen'

export function CreateInvitationScreen() {
  const { form, features } = useCreateInvitationScreen()

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          <I18nText id="dialog.create-invitation.title" />
        </DialogTitle>
      </DialogHeader>
      <form
        id="create-invitation-form"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.AppField name="expiresAt">
          {field => (
            <Field data-invalid={field.state.meta.isTouched && !!field.state.meta.errors.length}>
              <FieldLabel>
                <I18nText id="input.expires-at.label" />
              </FieldLabel>
              <Calendar
                mode="single"
                selected={field.state.value}
                onSelect={date => field.setValue(date ?? field.state.value)}
              />
              <FieldContent>
                <FieldDescription>
                  <I18nText
                    id="input.expires-at.description"
                    values={{
                      day: field.state.value.toLocaleDateString(),
                      time: field.state.value.toLocaleTimeString(),
                    }}
                  />
                </FieldDescription>
                <FieldError errors={[features.i18n.t(field.state.meta.errors)]} />
              </FieldContent>
            </Field>
          )}
        </form.AppField>
      </form>
      <DialogFooter className="flex justify-between!">
        <Button
          form="create-invitation-form"
          type="submit"
          disabled={form.state.isSubmitting}
        >
          {form.state.isSubmitting && <Spinner />}
          <I18nText id="button.create-invitation" />
        </Button>
      </DialogFooter>
    </>
  )
}
