import { object, string } from 'zod'

export const zodGooglePlacesAutocompletePrediction = object(
  {
    place_id: string(),
    description: string(),
  },
  { required_error: 'Please select a valid address' },
)
