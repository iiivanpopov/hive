import { createFileRoute } from '@tanstack/react-router'
import { MoonIcon, SunIcon } from 'lucide-react'

import type { Locale } from '@/providers/i18n-provider'

import { I18nText } from '@/components/i18n'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger } from '@/components/ui/select'
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
}, {
  value: 'ru-RU',
  label: 'Русский',
}]

function SettingsPage() {
  const { functions, features } = useSettingsPage()

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex flex-col gap-3">
        <Typography variant="heading">
          <I18nText id="section.appearance.title" />
        </Typography>
        <div>
          <Button
            variant="outline"
            onClick={functions.onThemeChange}
          >
            {features.theme.value === 'dark' && (
              <>
                <MoonIcon className="size-4" />
                <span>Dark</span>
              </>
            )}
            {features.theme.value === 'light' && (
              <>
                <SunIcon className="size-4" />
                <span>Light</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Typography variant="heading">
          <I18nText id="section.i18n.title" />
        </Typography>
        <div>
          <Select value={features.i18n.locale} onValueChange={functions.onLocaleChange}>
            <SelectTrigger>
              {LOCALES.find(locale => locale.value === features.i18n.locale)!.label}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>
                  <I18nText id="field.locale.label" />
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
