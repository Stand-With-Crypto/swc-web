import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { object, type z } from 'zod'

export const FORM_NAME = 'Call Congressperson - Find your representative'

export const findRepresentativeCallFormValidationSchema = object({
  address: zodGooglePlacesAutocompletePrediction,
})

export type FindRepresentativeCallFormValues = z.infer<
  typeof findRepresentativeCallFormValidationSchema
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
