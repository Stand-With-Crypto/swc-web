import * as Sentry from '@sentry/nextjs'

import { getGooglePlaceIdFromAddress } from '@/utils/server/getGooglePlaceIdFromAddress'
import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const GOOGLE_PLACES_BACKEND_API_KEY = requiredEnv(
  process.env.GOOGLE_PLACES_BACKEND_API_KEY,
  'GOOGLE_PLACES_BACKEND_API_KEY',
)

export async function getLatLongFromAddress(address: string) {
  const placeId = await getGooglePlaceIdFromAddress(address)

  const response = await fetchReq(
    `https://places.googleapis.com/v1/places/${placeId}?key=${GOOGLE_PLACES_BACKEND_API_KEY}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_BACKEND_API_KEY,
        'X-Goog-FieldMask': 'location',
      },
    },
  )

  const data = (await response.json()) as {
    location?: {
      latitude: number
      longitude: number
    }
  }

  if (!data?.location) {
    Sentry.captureMessage(`getLatLongFromAddress latitude and longitude not found`, {
      extra: { address, data },
    })
    throw new Error('No latitude and longitude found for address')
  }

  return data.location
}
