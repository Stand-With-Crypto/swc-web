import * as Sentry from '@sentry/nextjs'

import { getGooglePlaceIdFromAddress } from '@/utils/server/getGooglePlaceIdFromAddress'
import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const GOOGLE_PLACES_BACKEND_API_KEY = requiredEnv(
  process.env.GOOGLE_PLACES_BACKEND_API_KEY,
  'GOOGLE_PLACES_BACKEND_API_KEY',
)

/**
 * Gets latitude and longitude coordinates from a Google Places address
 * @param address The address to get coordinates for
 * @param placeId Optional Google Place ID. If provided, skips the request to fetch place ID from address
 * @returns Object containing latitude and longitude coordinates
 */
export async function getLatLongFromAddress(address: string, placeId?: string | null) {
  let placeIdToUse = placeId

  if (!placeIdToUse) {
    placeIdToUse = await getGooglePlaceIdFromAddress(address)
  }

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
