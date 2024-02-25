import * as Sentry from '@sentry/nextjs'

import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const GOOGLE_PLACES_BACKEND_API_KEY = requiredEnv(
  process.env.GOOGLE_PLACES_BACKEND_API_KEY,
  'process.env.GOOGLE_PLACES_BACKEND_API_KEY',
)

export async function getGooglePlaceIdFromAddress(address: string) {
  const response = await fetchReq(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${address}&key=${GOOGLE_PLACES_BACKEND_API_KEY}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  const data = (await response.json()) as {
    predictions: google.maps.places.AutocompletePrediction[]
  }
  if (data.predictions.length > 0) {
    return data.predictions[0].place_id
  } else {
    Sentry.captureMessage('getGooglePlaceIdFromAddress returned no google place id', {
      extra: { address, data },
    })
    throw new Error('No place ID found for address')
  }
}
