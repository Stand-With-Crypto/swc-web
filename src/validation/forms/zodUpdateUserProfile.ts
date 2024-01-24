import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { zodOptionalEmptyString } from '@/validation/utils'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { string, object, boolean } from 'zod'
import { zodFirstName, zodLastName } from '@/validation/fields/zodName'

const base = object({
  firstName: zodOptionalEmptyString(zodFirstName),
  lastName: zodOptionalEmptyString(zodLastName),
  emailAddress: zodOptionalEmptyString(
    string().trim().email('Please enter a valid email address').toLowerCase(),
  ),
  phoneNumber: zodOptionalEmptyString(zodPhoneNumber).transform(
    str => str && normalizePhoneNumber(str),
  ),
  isPubliclyVisible: boolean(),
})

export const zodUpdateUserProfileFormFields = base.extend({
  address: zodGooglePlacesAutocompletePrediction.nullable(),
})

export const zodUpdateUserProfileFormAction = base.extend({
  address: zodAddress.nullable(),
})
