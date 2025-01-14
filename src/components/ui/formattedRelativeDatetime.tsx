import { differenceInMinutes } from 'date-fns'

import { SupportedLocale } from '@/utils/shared/supportedLocales'

export function FormattedRelativeDatetime({
  date,
  locale,
  timeFormatStyle = 'short',
}: {
  date: Date
  locale: SupportedLocale
  timeFormatStyle?: Intl.RelativeTimeFormatStyle
}) {
  const minutesAgo = differenceInMinutes(new Date(), date)
  const intlRelative = new Intl.RelativeTimeFormat(locale, { style: timeFormatStyle })
  if (minutesAgo < 1) {
    return 'Just now'
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
