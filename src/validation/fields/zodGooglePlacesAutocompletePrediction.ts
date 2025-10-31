import { object, string } from 'zod'

export const zodGooglePlacesAutocompletePrediction = object(
  {
    place_id: string(),
    description: string(),
  },
  {
    error: _issue => 'Please select a valid address',
  },
)
