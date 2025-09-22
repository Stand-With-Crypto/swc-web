import AUContactYourRepresentativeReminderEmail from '@/utils/server/email/templates/au/contactYourRepresentativeReminder'
import CAContactYourRepresentativeReminderEmail from '@/utils/server/email/templates/ca/contactYourRepresentativeReminder'
import GBContactYourRepresentativeReminderEmail from '@/utils/server/email/templates/gb/contactYourRepresentativeReminder'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getContactYourRepresentativeReminderEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.CA:
      return CAContactYourRepresentativeReminderEmail
    case SupportedCountryCodes.AU:
      return AUContactYourRepresentativeReminderEmail
    case SupportedCountryCodes.GB:
      return GBContactYourRepresentativeReminderEmail
    default:
      return null
  }
}

export default getContactYourRepresentativeReminderEmail
