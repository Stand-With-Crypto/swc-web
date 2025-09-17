import AUFinishSettingUpProfileReminderEmail from '@/utils/server/email/templates/au/finishSettingUpProfileReminder'
import CAFinishSettingUpProfileReminderEmail from '@/utils/server/email/templates/ca/finishSettingUpProfileReminder'
import GBFinishSettingUpProfileReminderEmail from '@/utils/server/email/templates/gb/finishSettingUpProfileReminder'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getFinishSettingUpProfileReminderEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.CA:
      return CAFinishSettingUpProfileReminderEmail
    case SupportedCountryCodes.AU:
      return AUFinishSettingUpProfileReminderEmail
    case SupportedCountryCodes.GB:
      return GBFinishSettingUpProfileReminderEmail
    default:
      return null
  }
}

export default getFinishSettingUpProfileReminderEmail
