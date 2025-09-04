import z, { object, string } from 'zod'

import { GenericErrorFormValues } from '@/utils/web/formUtils'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'

const base = object({
  firstName: string().min(1, 'First name is required'),
  lastName: string().min(1, 'Last name is required'),
  emailAddress: string().email('Please enter a valid email address'),
  campaignName: string().min(1, 'Campaign name is required'),
})

// For client-side form (uses GooglePlaceAutocompletePrediction)
export const zodUserActionFormPetitionSignature = base.extend({
  address: zodGooglePlacesAutocompletePrediction.nullable(),
})

// For server action (uses converted Address)
export const zodUserActionFormPetitionSignatureAction = base
  .extend({
    address: zodAddress.nullable(),
  })
  .refine(data => data.address !== null, {
    message: 'Address could not be found',
    path: ['address'],
  })
  .transform(data => ({
    ...data,
    address: data.address!, // Safe to assert non-null after refinement
  }))

export type UserActionPetitionSignatureValues = z.infer<typeof zodUserActionFormPetitionSignature> &
  GenericErrorFormValues
export type UserActionPetitionSignatureActionValues = z.infer<
  typeof zodUserActionFormPetitionSignatureAction
>
