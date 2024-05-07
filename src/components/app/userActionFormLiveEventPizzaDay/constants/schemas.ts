import { object, string } from 'zod'

import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'

export const zodPizzaDayUserProfileFormFields = object({
  firstName: string().min(1, { message: 'first name is required' }),
  lastName: string().min(1, { message: 'last name is required' }),
  emailAddress: string()
    .email({ message: 'Invalid email address' })
    .min(1, { message: 'email is required' }),
  address: zodGooglePlacesAutocompletePrediction.required(),
  phoneNumber: string().min(1, { message: 'phone number is required' }),
})

export const zodProfileFieldsValidationForLiveEvent = object({
  firstName: string().min(1),
  lastName: string().min(1),
  primaryUserEmailAddress: object({
    emailAddress: string().email().min(1),
  }),
  address: object({
    id: string().min(1),
    googlePlaceId: string().min(1),
  }),
  phoneNumber: string().min(1),
})
