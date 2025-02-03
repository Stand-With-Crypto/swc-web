import { differenceInMinutes } from 'date-fns'

import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function FormattedRelativeDatetime({
  date,
  countryCode,
  timeFormatStyle = 'short',
}: {
  date: Date
  countryCode: SupportedCountryCodes
  timeFormatStyle?: Intl.RelativeTimeFormatStyle
}) {
  const minutesAgo = differenceInMinutes(new Date(), date)
  const intlRelative = new Intl.RelativeTimeFormat(COUNTRY_CODE_TO_LOCALE[countryCode], {
    style: timeFormatStyle,
  })
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
