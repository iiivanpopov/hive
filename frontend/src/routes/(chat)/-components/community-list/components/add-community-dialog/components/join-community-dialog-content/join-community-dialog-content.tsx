import type { useDisclosure } from '@/hooks/use-disclosure'

import { Button } from '@/components/ui/button'
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { I18nText } from '@/routes/-contexts/i18n/components/i18n-text'

import { useJoinCommunityDialogContent } from './hooks/use-join-community-dialog-content'

export interface JoinCommunityDialogProps {
  joinCommunityDialog: ReturnType<typeof useDisclosure>
}

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
              label={features.i18n.t('field.join-token.label')}
              error={features.i18n.t(field.state.meta.errors)}
            />
          )}
        </form.AppField>
      </form>
      <DialogFooter>
        <Button
          form="join-community-form"
          type="submit"
          disabled={form.state.isSubmitting}
        >
          {form.state.isSubmitting && <Spinner />}
          <I18nText id="button.join-community" />
        </Button>
      </DialogFooter>
    </>
  )
}
