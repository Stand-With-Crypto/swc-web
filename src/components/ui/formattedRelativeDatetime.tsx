'use client'

import { differenceInMinutes } from 'date-fns'

import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { getLocaleForLanguage } from '@/utils/shared/i18n/interpolationUtils'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      justNow: 'Just now',
    },
    de: {
      justNow: 'Gerade eben',
    },
    fr: {
      justNow: "À l'instant",
    },
  },
})

export function FormattedRelativeDatetime({
  date,
  timeFormatStyle = 'short',
}: {
  date: Date
  timeFormatStyle?: Intl.RelativeTimeFormatStyle
}) {
  const { t, language } = useTranslation(i18nMessages, 'FormattedRelativeDatetime')

  const locale = getLocaleForLanguage(language)

  const minutesAgo = differenceInMinutes(new Date(), date)
  const intlRelative = new Intl.RelativeTimeFormat(locale, {
    style: timeFormatStyle,
  })
  if (minutesAgo < 1) {
    return t('justNow')
  }
  if (minutesAgo < 60) {
    return intlRelative.format(-1 * minutesAgo, 'minutes')
  }
  const dayInMinutes = 60 * 24
  if (minutesAgo < dayInMinutes) {
    return intlRelative.format(Math.floor((-1 * minutesAgo) / 60), 'hours')
  }
  return intlRelative.format(Math.floor((-1 * minutesAgo) / dayInMinutes), 'days')
}
