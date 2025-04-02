import AUContactYourRepresentativeReminderEmail from '@/utils/server/email/templates/au/contactYourRepresentativeReminder'
import CAContactYourRepresentativeReminderEmail from '@/utils/server/email/templates/ca/contactYourRepresentativeReminder'
import GBContactYourRepresentativeReminderEmail from '@/utils/server/email/templates/gb/contactYourRepresentativeReminder'
import USContactYourRepresentativeReminderEmail from '@/utils/server/email/templates/us/contactYourRepresentativeReminder'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getContactYourRepresentativeReminderEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USContactYourRepresentativeReminderEmail
    case SupportedCountryCodes.CA:
      return CAContactYourRepresentativeReminderEmail
    case SupportedCountryCodes.AU:
      return AUContactYourRepresentativeReminderEmail
    case SupportedCountryCodes.GB:
      return GBContactYourRepresentativeReminderEmail
    default:
      return gracefullyError({
        msg: `No ContactYourRepresentativeReminderEmail template found for countryCode: ${countryCode as string}`,
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

export default getContactYourRepresentativeReminderEmail
