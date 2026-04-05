import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { Spinner } from '@/components/ui/spinner.tsx'

import { useJoinCommunityDialogContent } from './hooks/use-join-community-dialog-content.ts'

export function JoinCommunityDialog() {
  const { features, form } = useJoinCommunityDialogContent()

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          <I18nText id="dialog.join-community.title" />
        </DialogTitle>
      </DialogHeader>
      <form
        id="join-community-form"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.AppField name="token">
          {field => (
            <field.Input
              label={features.i18n.t('input.invite-token.label')}
              error={features.i18n.t(field.state.meta.errors)}
            />
          )}
        </form.AppField>
      </form>
      <DialogFooter className="flex justify-between!">
        <Button
          variant="secondary"
          onClick={() => features.addCommunityDialog.setScreen('add')}
        >
          <I18nText id="button.back" />
        </Button>
        <form.Subscribe selector={state => state.isSubmitting}>
          {isSubmitting => (
            <Button
              form="join-community-form"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              <I18nText id="button.join-community" />
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </>
  )
}
