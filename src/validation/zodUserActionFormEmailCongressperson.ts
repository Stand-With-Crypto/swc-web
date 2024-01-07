import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { zodOptionalEmptyString } from '@/validation/utils'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { zodPhoneNumber } from '@/validation/fields/zodPhoneNumber'
import { string, object, union, any, boolean } from 'zod'
import { zodDTSISlug } from '@/validation/fields/zodDTSISlug'

const base = object({
  fullName: string()
    .trim()
    .min(1, 'Please enter your full name')
    .max(100, 'Please enter your full name'),
  email: string().trim().email('Please enter a valid email address').toLowerCase(),
  phoneNumber: zodPhoneNumber.transform(str => str && normalizePhoneNumber(str)),
  message: string().min(1, 'Please enter a message').max(1000, 'Please enter a message'),
  dtsiSlug: zodDTSISlug,
})

export const zodUserActionFormEmailCongresspersonFields = base.extend({
  address: zodGooglePlacesAutocompletePrediction,
})

export const zodUserActionFormEmailCongresspersonAction = base.extend({
  address: zodAddress,
})
