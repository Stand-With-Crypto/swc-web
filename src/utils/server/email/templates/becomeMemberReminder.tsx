import AUBecomeMemberReminderEmail from '@/utils/server/email/templates/au/becomeMemberReminder'
import CABecomeMemberReminderEmail from '@/utils/server/email/templates/ca/becomeMemberReminder'
import GBBecomeMemberReminderEmail from '@/utils/server/email/templates/gb/becomeMemberReminder'
import USBecomeMemberReminderEmail from '@/utils/server/email/templates/us/becomeMemberReminder'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getBecomeMemberReminderEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USBecomeMemberReminderEmail
    case SupportedCountryCodes.CA:
      return CABecomeMemberReminderEmail
    case SupportedCountryCodes.AU:
      return AUBecomeMemberReminderEmail
    case SupportedCountryCodes.GB:
      return GBBecomeMemberReminderEmail
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
