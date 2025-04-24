import { boolean, object } from 'zod'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'

export const zodUpdateUserHasOptedInToSMS = (countryCode: SupportedCountryCodes) =>
  object({
    phoneNumber: zodPhoneNumber(countryCode).superRefine((phoneNumber, ctx) => {
      if (!phoneNumber) {
        ctx.addIssue({
          code: 'custom',
          message: 'Please enter a phone number to opt in to SMS',
          path: ['phoneNumber'],
        })
      }
    }),
    optedInToSms: boolean().refine(value => value === true, 'You must opt in to get updates'),
  })
