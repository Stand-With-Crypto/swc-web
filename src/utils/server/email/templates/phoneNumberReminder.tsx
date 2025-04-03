import AUPhoneNumberReminderEmail from '@/utils/server/email/templates/au/phoneNumberReminder'
import CAPhoneNumberReminderEmail from '@/utils/server/email/templates/ca/phoneNumberReminder'
import GBPhoneNumberReminderEmail from '@/utils/server/email/templates/gb/phoneNumberReminder'
import USPhoneNumberReminderEmail from '@/utils/server/email/templates/us/phoneNumberReminder'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getPhoneNumberReminderEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USPhoneNumberReminderEmail
    case SupportedCountryCodes.CA:
      return CAPhoneNumberReminderEmail
    case SupportedCountryCodes.AU:
      return AUPhoneNumberReminderEmail
    case SupportedCountryCodes.GB:
      return GBPhoneNumberReminderEmail
    default:
      return gracefullyError({
        msg: `No PhoneNumberReminderEmail template found for countryCode: ${countryCode as string}`,
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

export default getPhoneNumberReminderEmail
