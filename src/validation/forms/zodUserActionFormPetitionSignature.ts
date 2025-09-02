import z, { object, string } from 'zod'

import { zodAddress } from '@/validation/fields/zodAddress'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'

const base = object({
  firstName: string().nonempty('First name is required'),
  lastName: string().nonempty('Last name is required'),
  emailAddress: string().email('Please enter a valid email address'),
  campaignName: string().nonempty('Campaign name is required'),
})

// For client-side form (uses GooglePlaceAutocompletePrediction)
export const zodUserActionFormPetitionSignature = base.extend({
  address: zodGooglePlacesAutocompletePrediction.nullable(),
})

// For server action (uses converted Address)
export const zodUserActionFormPetitionSignatureAction = base.extend({
  address: zodAddress.nullable(),
})

export type UserActionPetitionSignatureValues = z.infer<typeof zodUserActionFormPetitionSignature>
export type UserActionPetitionSignatureActionValues = z.infer<
  typeof zodUserActionFormPetitionSignatureAction
>
