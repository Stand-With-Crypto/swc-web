import { object, string } from 'zod'

export const zodGooglePlacesAutocompletePrediction = object(
  {
    description: string(),
    place_id: string(),
  },
  { required_error: 'Please select a valid address' },
)
