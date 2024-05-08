import { object, string } from 'zod'

export const zodGooglePlacesAutocompletePrediction = object(
  {
    place_id: string().min(1, { message: 'Please select a valid address' }),
    description: string().min(1, { message: 'Please select a valid address' }),
  },
  {
    required_error: 'Please select a valid address',
    invalid_type_error: 'Please select a valid address',
  },
)
