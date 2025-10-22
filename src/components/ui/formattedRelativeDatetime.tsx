'use client'

import { useEffect, useState } from 'react'
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
  const [formattedTime, setFormattedTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const minutesAgo = differenceInMinutes(new Date(), date)
      const intlRelative = new Intl.RelativeTimeFormat(COUNTRY_CODE_TO_LOCALE[countryCode], {
        style: timeFormatStyle,
      })

      if (minutesAgo < 1) {
        setFormattedTime('Just now')
      } else if (minutesAgo < 60) {
        setFormattedTime(intlRelative.format(-1 * minutesAgo, 'minutes'))
      } else {
        const dayInMinutes = 60 * 24
        if (minutesAgo < dayInMinutes) {
          setFormattedTime(intlRelative.format(Math.floor((-1 * minutesAgo) / 60), 'hours'))
        } else {
          setFormattedTime(
            intlRelative.format(Math.floor((-1 * minutesAgo) / dayInMinutes), 'days'),
          )
        }
      }
    }

    updateTime()

    const interval = setInterval(updateTime, 60 * 1_000)

    return () => {
      clearInterval(interval)
    }
  }, [date, countryCode, timeFormatStyle])

  // Return empty string during SSR to avoid hydration mismatch
  return <>{formattedTime}</>
}
