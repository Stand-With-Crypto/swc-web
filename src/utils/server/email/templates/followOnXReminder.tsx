import AUFollowOnXReminderEmail from '@/utils/server/email/templates/au/followOnXReminder'
import CAFollowOnXReminderEmail from '@/utils/server/email/templates/ca/followOnXReminder'
import EUFollowOnXReminderEmail from '@/utils/server/email/templates/eu/followOnXReminder'
import GBFollowOnXReminderEmail from '@/utils/server/email/templates/gb/followOnXReminder'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getFollowOnXReminderEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.CA:
      return CAFollowOnXReminderEmail
    case SupportedCountryCodes.AU:
      return AUFollowOnXReminderEmail
    case SupportedCountryCodes.GB:
      return GBFollowOnXReminderEmail
    case SupportedCountryCodes.EU:
      return EUFollowOnXReminderEmail
    default:
      return null
  }
}

export default getFollowOnXReminderEmail
