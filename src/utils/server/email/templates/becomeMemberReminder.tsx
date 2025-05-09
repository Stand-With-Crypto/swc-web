import USBecomeMemberReminderEmail from '@/utils/server/email/templates/us/becomeMemberReminder'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getBecomeMemberReminderEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USBecomeMemberReminderEmail
    case SupportedCountryCodes.CA:
      return null
    case SupportedCountryCodes.AU:
      return null
    case SupportedCountryCodes.GB:
      return null
    default:
      return gracefullyError({
        msg: `No BecomeMemberReminderEmail template found for countryCode: ${countryCode as string}`,
        fallback: null,
        hint: {
          tags: {
            domain: 'email',
          },
          extra: {
            countryCode,
          },
        },
      })
  }
}

export default getBecomeMemberReminderEmail
