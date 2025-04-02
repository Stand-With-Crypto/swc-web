import AURegisterToVoteReminderEmail from '@/utils/server/email/templates/au/registerToVoteReminder'
import CARegisterToVoteReminderEmail from '@/utils/server/email/templates/ca/registerToVoteReminder'
import GBRegisterToVoteReminderEmail from '@/utils/server/email/templates/gb/registerToVoteReminder'
import USRegisterToVoteReminderEmail from '@/utils/server/email/templates/us/registerToVoteReminder'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function getRegisterToVoteReminderEmail(countryCode: SupportedCountryCodes) {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return USRegisterToVoteReminderEmail
    case SupportedCountryCodes.CA:
      return CARegisterToVoteReminderEmail
    case SupportedCountryCodes.AU:
      return AURegisterToVoteReminderEmail
    case SupportedCountryCodes.GB:
      return GBRegisterToVoteReminderEmail
    default:
      return gracefullyError({
        msg: `No RegisterToVoteReminderEmail template found for countryCode: ${countryCode as string}`,
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

export default getRegisterToVoteReminderEmail
