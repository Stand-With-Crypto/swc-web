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
