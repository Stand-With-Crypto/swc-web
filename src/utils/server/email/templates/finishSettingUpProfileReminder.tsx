import AUFinishSettingUpProfileReminderEmail from '@/utils/server/email/templates/au/finishSettingUpProfileReminder'
import CAFinishSettingUpProfileReminderEmail from '@/utils/server/email/templates/ca/finishSettingUpProfileReminder'
import GBFinishSettingUpProfileReminderEmail from '@/utils/server/email/templates/gb/finishSettingUpProfileReminder'
import USFinishSettingUpProfileReminderEmail from '@/utils/server/email/templates/us/finishSettingUpProfileReminder'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getFinishSettingUpProfileReminderEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USFinishSettingUpProfileReminderEmail
    case SupportedCountryCodes.CA:
      return CAFinishSettingUpProfileReminderEmail
    case SupportedCountryCodes.AU:
      return AUFinishSettingUpProfileReminderEmail
    case SupportedCountryCodes.GB:
      return GBFinishSettingUpProfileReminderEmail
    default:
      return gracefullyError({
        msg: `No FinishSettingUpProfileReminderEmail template found for countryCode: ${countryCode as string}`,
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

export default getFinishSettingUpProfileReminderEmail
