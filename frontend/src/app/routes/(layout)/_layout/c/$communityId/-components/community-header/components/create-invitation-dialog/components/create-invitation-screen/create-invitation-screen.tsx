import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldContent, FieldDescription, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'

import { useCreateInvitationScreen } from './hooks/use-create-invitation-screen'

export function CreateInvitationScreen() {
  const { form, features } = useCreateInvitationScreen()

  return (
    <div className="flex h-150 flex-col gap-y-4">
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
        className="flex-1"
      >
        <form.AppField name="expiresAt">
          {field => (
            <Field data-invalid={field.state.meta.isTouched && !!field.state.meta.errors.length}>
              <Calendar
                mode="single"
                selected={field.state.value}
                onSelect={date => field.setValue(date!)}
              />
              <FieldContent>
                <FieldDescription>
                  {field.state.value && (
                    <I18nText
                      id="input.expires-at.description"
                      values={{
                        day: field.state.value.toLocaleDateString(),
                        time: field.state.value.toLocaleTimeString(),
                      }}
                    />
                  )}
                  {!field.state.value && <I18nText id="input.expires-at.never-expires" />}
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
          className="w-full"
        >
          {form.state.isSubmitting && <Spinner />}
          <I18nText id="button.create-invitation" />
        </Button>
      </DialogFooter>
    </div>
  )
}
