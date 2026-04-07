import { createFileRoute } from '@tanstack/react-router'
import { CheckIcon, MoonIcon, SunIcon } from 'lucide-react'

import type { Locale } from '@/providers/i18n-provider'

import { I18nText } from '@/components/i18n'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'

import { useSettingsPage } from './-hooks/use-settings-page'

export const Route = createFileRoute('/(layout)/_layout/settings/')({
  component: SettingsPage,
  head: () => ({
    meta: [{ title: ' Hive | Settings' }],
  }),
})

const LOCALES: {
  value: Locale
  label: string
}[] = [{
  value: 'en-US',
  label: 'English',
}, {
  value: 'uk-UA',
  label: 'Українська',
}]

function SettingsPage() {
  const { functions, features } = useSettingsPage()

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <Typography variant="subheading">
          <I18nText id="settings.theme.title" />
        </Typography>
        <Typography variant="caption">
          <I18nText id="settings.theme.caption" />
        </Typography>
        <div className="mt-4 flex gap-3">
          <button
            className={`
              relative flex size-16 cursor-pointer items-center justify-center
              rounded-md border-[3px] border-transparent bg-zinc-100
              text-zinc-950 transition-colors
              data-[active=true]:border-primary
            `}
            onClick={e => functions.onThemeChange('light', e)}
            data-active={features.theme.value === 'light'}
            aria-label="Light theme"
          >
            {features.theme.value === 'light' && (
              <span className="
                absolute top-0 right-0 flex size-5 translate-x-1/2
                -translate-y-1/2 items-center justify-center rounded-full
                bg-primary text-primary-foreground
              "
              >
                <CheckIcon className="size-3" />
              </span>
            )}
            <SunIcon />
          </button>

          <button
            className={`
              relative flex size-16 cursor-pointer items-center justify-center
              rounded-md border-[3px] border-transparent bg-zinc-950
              text-zinc-50 transition-colors
              data-[active=true]:border-primary
            `}
            onClick={e => functions.onThemeChange('dark', e)}
            data-active={features.theme.value === 'dark'}
            aria-label="Dark theme"
          >
            {features.theme.value === 'dark' && (
              <span className="
                absolute top-0 right-0 flex size-5 translate-x-1/2
                -translate-y-1/2 items-center justify-center rounded-full
                bg-primary text-primary-foreground
              "
              >
                <CheckIcon className="size-3" />
              </span>
            )}
            <MoonIcon />
          </button>
        </div>
      </div>

      <Separator />

      <div>
        <Typography variant="subheading">
          <I18nText id="settings.language.title" />
        </Typography>
        <Typography variant="caption">
          <I18nText id="settings.language.caption" />
        </Typography>
        <div className="mt-4">
          <Select value={features.i18n.locale} onValueChange={functions.onLocaleChange}>
            <SelectTrigger>
              {LOCALES.find(locale => locale.value === features.i18n.locale)!.label}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>
                  <I18nText id="input.locale.label" />
                </SelectLabel>
                {LOCALES.map(locale => (
                  <SelectItem key={locale.value} value={locale.value}>
                    {locale.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
