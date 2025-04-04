import { object } from 'zod'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodPhoneNumberWithCountryCode } from '@/validation/fields/zodPhoneNumber'

export const zodUpdateUserHasOptedInToSMS = (countryCode: SupportedCountryCodes) =>
  object({
    phoneNumber: zodPhoneNumberWithCountryCode(countryCode).superRefine((phoneNumber, ctx) => {
      if (!phoneNumber) {
        ctx.addIssue({
          code: 'custom',
          message: 'Please enter a phone number to opt in to SMS',
          path: ['phoneNumber'],
        })
      }
    }),
  })
