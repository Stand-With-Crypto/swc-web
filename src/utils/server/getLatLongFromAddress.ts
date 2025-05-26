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
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_BACKEND_API_KEY}`,
  )

  const data = (await response.json()) as {
    result: {
      geometry?: {
        location?: {
          lat: number
          lng: number
        }
      }
    }
  }

  if (!data?.result?.geometry?.location) {
    Sentry.captureMessage(`getLatLongFromAddress latitude and longitude not found`, {
      extra: { address, data },
    })
    throw new Error('No latitude and longitude found for address')
  }

  return data.result.geometry.location
}
