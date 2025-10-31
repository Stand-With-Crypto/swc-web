import { object, string } from 'zod'

export const zodGooglePlacesAutocompletePrediction = object({
  place_id: string({ message: 'Please select a valid address' }),
  description: string({ message: 'Please select a valid address' }),
})
