import { SupportedLocale } from '@/intl/locales'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { differenceInMinutes } from 'date-fns'

export function FormattedRelativeDatetime({
  date,
  locale,
}: {
  date: Date
  locale: SupportedLocale
}) {
  const minutesAgo = differenceInMinutes(new Date(), date)
  const intlRelative = new Intl.RelativeTimeFormat(locale, { style: 'short' })
  if (minutesAgo < 60) {
    return intlRelative.format(-1 * minutesAgo, 'minutes')
  }
  const dayInMinutes = 60 * 24
  if (minutesAgo < dayInMinutes) {
    return intlRelative.format(Math.floor((-1 * minutesAgo) / 60), 'hours')
  }
  return intlRelative.format(Math.floor((-1 * minutesAgo) / dayInMinutes), 'days')
}
