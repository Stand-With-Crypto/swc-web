import AUReactivationReminderEmail from '@/utils/server/email/templates/au/reactivationReminder'
import CAReactivationReminderEmail from '@/utils/server/email/templates/ca/reactivationReminder'
import GBReactivationReminderEmail from '@/utils/server/email/templates/gb/reactivationReminder'
import USReactivationReminderEmail from '@/utils/server/email/templates/us/reactivationReminder'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getReactivationReminderEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USReactivationReminderEmail
    case SupportedCountryCodes.CA:
      return CAReactivationReminderEmail
    case SupportedCountryCodes.AU:
      return AUReactivationReminderEmail
    case SupportedCountryCodes.GB:
      return GBReactivationReminderEmail
    default:
      return gracefullyError({
        msg: `No ReactivationReminderEmail template found for countryCode: ${countryCode as string}`,
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

export default getReactivationReminderEmail
