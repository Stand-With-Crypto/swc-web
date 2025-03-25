import { object, type z } from 'zod'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'

export const FORM_NAME = 'Voter Guide - Get Informed'

export const voterGuideFormValidationSchema = object({
  address: zodGooglePlacesAutocompletePrediction,
})

export type VoterGuideFormValues = z.infer<typeof voterGuideFormValidationSchema>

export function getDefaultValues({ user }: { user?: GetUserFullProfileInfoResponse['user'] }) {
  return user?.address
    ? {
        address: {
          description: user?.address.formattedDescription,
          place_id: user?.address.googlePlaceId,
        },
      }
    : undefined
}
