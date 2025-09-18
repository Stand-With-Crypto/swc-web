import AUPhoneNumberReminderEmail from '@/utils/server/email/templates/au/phoneNumberReminder'
import CAPhoneNumberReminderEmail from '@/utils/server/email/templates/ca/phoneNumberReminder'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getPhoneNumberReminderEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.CA:
      return CAPhoneNumberReminderEmail
    case SupportedCountryCodes.AU:
      return AUPhoneNumberReminderEmail
    case SupportedCountryCodes.GB:
      return null
    default:
      return null
  }
}

export default getPhoneNumberReminderEmail
