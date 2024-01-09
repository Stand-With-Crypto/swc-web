import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { zodOptionalEmptyString } from '@/validation/utils'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { string, object, union, any, boolean } from 'zod'

const base = object({
  fullName: zodOptionalEmptyString(
    string().trim().min(1, 'Please enter your full name').max(100, 'Please enter your full name'),
  ),
  email: zodOptionalEmptyString(
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
