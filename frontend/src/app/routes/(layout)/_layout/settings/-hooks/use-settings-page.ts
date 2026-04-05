import type { MouseEvent } from 'react'

import type { Locale } from '@/providers/i18n-provider'
import type { Theme } from '@/providers/theme-provider'

import { useI18n } from '@/providers/i18n-provider'
import { useTheme } from '@/providers/theme-provider'

export function useSettingsPage() {
  const i18n = useI18n()
  const theme = useTheme()

  const onThemeChange = (newTheme: Theme, event: MouseEvent) => {
    document.startViewTransition(() => theme.set(newTheme))

    const x = event.clientX
    const y = event.clientY
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${radius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 350,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  }
  const onLocaleChange = (locale: Locale | null) => i18n.setLocale(locale ?? 'en-US')

  return {
    functions: {
      onThemeChange,
      onLocaleChange,
    },
    features: {
      i18n,
      theme,
    },
  }
}
