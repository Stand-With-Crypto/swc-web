import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'
import { zodOptionalEmptyString } from '@/validation/utils'

import { zodUpdateUserProfileBase, zodUpdateUserProfileBaseSuperRefine } from './base'

export const zodUpdateUserProfileFormFields = zodUpdateUserProfileBase
  .extend({
    firstName: zodOptionalEmptyString(zodFirstName),
    lastName: zodOptionalEmptyString(zodLastName),
    address: zodGooglePlacesAutocompletePrediction.nullable(),
  })
  .superRefine(zodUpdateUserProfileBaseSuperRefine)
  .superRefine((data, ctx) => {
    const { firstName, lastName, emailAddress, hasOptedInToMembership } = data

    const canOptInToMembership = !!firstName && !!lastName && !!emailAddress
    if (hasOptedInToMembership && !canOptInToMembership) {
      ctx.addIssue({
        code: 'custom',
        message: 'You must fill first name, last name and email address to opt in to membership',
        path: ['hasOptedInToMembership'],
      })
    }
  })
