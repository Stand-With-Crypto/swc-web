import { object, type z } from 'zod'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'

export const FORM_NAME = 'Voter Attestation - Address'

export const findVoterAttestationFormValidationSchema = object({
  address: zodGooglePlacesAutocompletePrediction,
})

export type FindVoterAttestationFormValues = z.infer<
  typeof findVoterAttestationFormValidationSchema
>

export function getDefaultValues({ user }: { user?: GetUserFullProfileInfoResponse['user'] }) {
  return {
    address: user?.address
      ? {
          description: user?.address.formattedDescription,
          place_id: user?.address.googlePlaceId,
        }
      : undefined,
  }
}
