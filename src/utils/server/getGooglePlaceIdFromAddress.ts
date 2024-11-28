import * as Sentry from '@sentry/nextjs'

import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const GOOGLE_PLACES_BACKEND_API_KEY = requiredEnv(
  process.env.GOOGLE_PLACES_BACKEND_API_KEY,
  'GOOGLE_PLACES_BACKEND_API_KEY',
)

export async function getGooglePlaceIdFromAddress(address: string) {
  const response = await fetchReq(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(address)}&loading=async&language=en&key=${GOOGLE_PLACES_BACKEND_API_KEY}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  const data = (await response.json()) as {
    error_message?: string
    info_messages?: string[]
    predictions: google.maps.places.AutocompletePrediction[]
    status: `${google.maps.places.PlacesServiceStatus}`
  }
  if (data.predictions.length > 0) {
    return data.predictions[0].place_id
  } else if (data.status !== 'ZERO_RESULTS') {
    Sentry.captureMessage(`getGooglePlaceIdFromAddress no results with status ${data.status}`, {
      extra: { address, data },
    })
  }
  throw new Error('No place ID found for address')
}
