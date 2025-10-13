import AUFinishSettingUpProfileReminderEmail from '@/utils/server/email/templates/au/finishSettingUpProfileReminder'
import CAFinishSettingUpProfileReminderEmail from '@/utils/server/email/templates/ca/finishSettingUpProfileReminder'
import EUFinishSettingUpProfileReminderEmail from '@/utils/server/email/templates/eu/finishSettingUpProfileReminder'
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
    case SupportedCountryCodes.EU:
      return EUFinishSettingUpProfileReminderEmail
    default:
      return null
  }
}

export default getFinishSettingUpProfileReminderEmail
