import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Outlet, redirect, useNavigate, useParams } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'
import { useRef } from 'react'
import { toast } from 'sonner'
import z from 'zod'

import { getCommunitiesJoinedOptions, postCommunitiesMutation } from '@/api/@tanstack/react-query.gen'
import { useForm } from '@/components/form/hooks'
import { I18nText } from '@/components/i18n/i18n-text'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Spinner } from '@/components/ui/spinner'
import { Typography } from '@/components/ui/typography'
import { useBoolean } from '@/hooks/use-boolean/use-boolean'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer/use-intersection-observer'
import { cn } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'
import { queryClient } from '@/providers/query-provider'

export const Route = createFileRoute('/(root)/_communities')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (!context.user)
      throw redirect({ to: '/login' })
  },
  loader: async () => {
    return queryClient.ensureQueryData(getCommunitiesJoinedOptions())
  },
})

const CreateCommunityFormSchema = z.object({
  name: z
    .string()
    .min(3, 'validation.community-name.min')
    .max(50, 'validation.community-name.max'),
})

export type CreateCommunityFormData = z.infer<typeof CreateCommunityFormSchema>

const createCommunityFormDefaultValues = {
  name: '',
} satisfies CreateCommunityFormData

function RouteComponent() {
  const navigate = useNavigate()
  const { communities } = Route.useLoaderData()
  const params = useParams({ from: '/(root)/_communities/$slug/' })
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useBoolean(false)
  const { t } = useI18n()

  const createCommunityMutation = useMutation({
    ...postCommunitiesMutation(),
    onSuccess: async ({ community }) => {
      toast.success(t('toast.community-created', { name: community.name }))

      await queryClient.refetchQueries(getCommunitiesJoinedOptions())

      navigate({
        to: '/$slug',
        params: { slug: community.slug },
      })
    },
  })

  const createCommunityForm = useForm({
    defaultValues: createCommunityFormDefaultValues,
    validators: { onChange: CreateCommunityFormSchema },
    onSubmit: async ({ value, formApi }) => {
      await createCommunityMutation.mutateAsync({ body: { name: value.name } })
      formApi.reset()
      setIsCreateCommunityModalOpen(false)
    },
  })

  const listRef = useRef<HTMLDivElement | null>(null)

  const [addServerInView, setAddServerInView] = useBoolean(true)
  const [lastServerInView, setLastServerInView] = useBoolean(true)

  const addServerIntersectionObserver = useIntersectionObserver<HTMLButtonElement>({
    root: listRef,
    threshold: 0.2,
    onChange: entries => setAddServerInView(entries.some(e => e.isIntersecting)),
  })

  const lastServerIntersectionObserver = useIntersectionObserver<HTMLButtonElement>({
    root: listRef,
    threshold: 0.2,
    onChange: entries => setLastServerInView(entries.some(e => e.isIntersecting)),
  })

  return (
    <div className="flex min-h-screen min-w-screen">
      <div className="bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-200/75">
        <div className="relative h-[92vh] py-12 w-20 flex justify-center">
          <div
            ref={listRef}
            className="h-full flex no-scrollbar flex-col gap-2 overflow-y-auto items-center"
          >
            <Dialog
              modal={true}
              open={isCreateCommunityModalOpen}
              onOpenChange={setIsCreateCommunityModalOpen}
            >
              <DialogTrigger
                render={props => (
                  <button
                    {...props}
                    ref={addServerIntersectionObserver.ref}
                    className="size-12 aspect-square shrink-0 flex items-center justify-center rounded-lg bg-zinc-300 text-white hover:bg-zinc-400/50 cursor-pointer transition-colors"
                  >
                    <PlusIcon size={24} strokeWidth={3} />
                  </button>
                )}
              />

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    <Typography variant="heading">
                      <I18nText id="form.create-community.title" />
                    </Typography>
                  </DialogTitle>
                </DialogHeader>

                <form
                  id="create-community-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    createCommunityForm.handleSubmit()
                  }}
                >
                  <FieldSet>
                    <FieldLegend className="sr-only">
                      <I18nText id="form.create-community.title" />
                    </FieldLegend>
                    <FieldGroup>
                      <createCommunityForm.AppField name="name">
                        {field => (
                          <field.Input
                            label={t('field.community-name.label')}
                            error={t(field.state.meta.errors)}
                          />
                        )}
                      </createCommunityForm.AppField>
                    </FieldGroup>
                  </FieldSet>
                </form>

                <DialogFooter>
                  <Button
                    type="submit"
                    form="create-community-form"
                    disabled={createCommunityMutation.isPending}
                  >
                    {createCommunityMutation.isPending && <Spinner />}
                    <I18nText id="button.create-community" />
                  </Button>
                  <DialogClose
                    render={props => (
                      <Button {...props} variant="destructive">
                        <I18nText id="button.close" />
                      </Button>
                    )}
                  />
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {communities.map((community, i) => {
              const isActive = params.slug === community.slug

              return (
                <div
                  key={community.id}
                  className="w-20 h-12 flex justify-center relative"
                >
                  <Popover
                    modal={false}
                  >
                    <PopoverTrigger
                      openOnHover={true}
                      nativeButton={false}
                      delay={500}
                      closeDelay={100}
                      render={({ children, ...props }) => <div {...props}>{children}</div>} // fix for ref overriding
                    >
                      <button
                        ref={i === communities.length - 1 ? lastServerIntersectionObserver.ref : undefined}
                        onClick={() =>
                          navigate({
                            to: '/$slug',
                            params: { slug: community.slug },
                          })}
                        className={cn(
                          'cursor-pointer w-12 h-12 shrink-0 flex items-center justify-center rounded-lg bg-primary/80 text-primary-foreground transition-colors hover:bg-primary',
                          isActive && 'bg-primary',
                        )}
                      >
                        <span className="text-xl font-bold select-none">
                          {community.name[0]!.toUpperCase()}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-fit px-2 py-1"
                      side="right"
                    >
                      {community.name}
                    </PopoverContent>
                  </Popover>
                  {isActive && (
                    <div className="absolute w-3 h-10 rounded-br-sm rounded-tr-sm bg-primary left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 animate-in fade-in zoom-in-0 duration-200" />
                  )}
                </div>
              )
            })}
          </div>

          {!addServerInView && (
            <div className="pointer-events-none absolute top-6 left-2 right-2">
              <div className="text-sm rounded-sm bg-zinc-200 py-0.5 px-1.5 text-muted-foreground animate-in fade-in zoom-in-0 duration-200">
                more...
              </div>
            </div>
          )}

          {!lastServerInView && (
            <div className="pointer-events-none absolute bottom-6 left-2 right-2">
              <div className="text-sm rounded-sm bg-zinc-200 py-0.5 px-1.5 text-muted-foreground animate-in fade-in zoom-in-0 duration-200">
                more...
              </div>
            </div>
          )}
        </div>
      </div>

      <Outlet />
    </div>
  )
}
