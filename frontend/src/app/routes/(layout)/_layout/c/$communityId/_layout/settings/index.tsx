import { createFileRoute, redirect } from '@tanstack/react-router'
import z from 'zod'

import { getCommunitiesCommunityIdOptions } from '@/api/@tanstack/react-query.gen'
import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { queryClient } from '@/lib/query-client'

import { useCommunitySettingsPage } from './-hooks/use-community-settings-page'

const RouteParamsSchema = z.object({
  communityId: z.coerce.number().int().positive(),
})

export const Route = createFileRoute('/(layout)/_layout/c/$communityId/_layout/settings/')({
  component: CommunitySettingsPage,
  params: RouteParamsSchema,
  loader: async ({ context, params: { communityId } }) => {
    const community = await queryClient.ensureQueryData(getCommunitiesCommunityIdOptions({
      path: { communityId },
    }))

    if (community.community.ownerId !== context.user?.id) {
      throw redirect({
        to: '/c/$communityId',
        params: { communityId },
      })
    }
  },
  head: () => ({
    meta: [{ title: 'Hive | Community settings' }],
  }),
})

function CommunitySettingsPage() {
  const { features, forms, functions, mutations, state } = useCommunitySettingsPage()

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-scroll p-8 pb-128">
      <div>
        <Typography variant="heading">
          <I18nText id="community-settings.page.title" />
        </Typography>
        <Typography variant="caption">
          <I18nText id="community-settings.page.caption" values={{ communityName: state.community.name }} />
        </Typography>
      </div>

      <Separator />

      <div>
        <Typography variant="subheading">
          <I18nText id="community-settings.info.title" />
        </Typography>
        <Typography variant="caption">
          <I18nText id="community-settings.info.caption" />
        </Typography>

        <form
          id="community-settings-form"
          className="mt-4 max-w-md"
          onSubmit={(event) => {
            event.preventDefault()
            forms.community.handleSubmit()
          }}
        >
          <FieldSet>
            <FieldLegend className="sr-only">
              <I18nText id="community-settings.info.title" />
            </FieldLegend>

            <FieldGroup>
              <forms.community.AppField name="name">
                {field => (
                  <field.Input
                    label={features.i18n.t('input.community-name.label')}
                    error={features.i18n.t(field.state.meta.errors)}
                  />
                )}
              </forms.community.AppField>
            </FieldGroup>
          </FieldSet>
        </form>

        <forms.community.Subscribe selector={formState => formState.isSubmitting}>
          {isSubmitting => (
            <Button
              className="mt-4"
              type="submit"
              form="community-settings-form"
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner />}
              <I18nText id="community-settings.info.submit" />
            </Button>
          )}
        </forms.community.Subscribe>
      </div>

      <Separator />

      <div>
        <Typography variant="subheading">
          <I18nText id="community-settings.danger.title" />
        </Typography>
        <Typography variant="caption">
          <I18nText id="community-settings.danger.caption" />
        </Typography>

        <div className="mt-4 max-w-md">
          <Field>
            <FieldContent>
              <FieldDescription>
                <I18nText id="community-settings.danger.description" values={{ communityName: state.community.name }} />
              </FieldDescription>
            </FieldContent>

            <Button
              type="button"
              variant="destructive"
              onClick={features.deleteDialog.open}
              disabled={mutations.deleteCommunity.isPending}
            >
              <I18nText id="button.delete-community" />
            </Button>
          </Field>
        </div>
      </div>

      {features.deleteDialog.opened && (
        <Dialog open onOpenChange={features.deleteDialog.toggle}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <I18nText id="dialog.delete-community.title" />
              </DialogTitle>
              <DialogDescription>
                <I18nText id="dialog.delete-community.description" values={{ communityName: state.community.name }} />
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="justify-between!">
              <Button variant="outline" onClick={() => features.deleteDialog.close()}>
                <I18nText id="button.cancel" />
              </Button>

              <Button
                variant="destructive"
                disabled={mutations.deleteCommunity.isPending}
                onClick={functions.deleteCommunity}
              >
                {mutations.deleteCommunity.isPending && (
                  <Spinner className="size-4" />
                )}
                <I18nText id="button.delete-community" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
