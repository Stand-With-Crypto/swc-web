import * as Sentry from '@sentry/nextjs'

import { getGooglePlaceIdFromAddress } from '@/utils/server/getGooglePlaceIdFromAddress'
import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const GOOGLE_PLACES_BACKEND_API_KEY = requiredEnv(
  process.env.GOOGLE_PLACES_BACKEND_API_KEY,
  'GOOGLE_PLACES_BACKEND_API_KEY',
)

type Args =
  | {
      address: string
      placeId?: string
    }
  | {
      address?: string
      placeId: string
    }

export async function getLatLongFromAddressOrPlaceId(params: Args) {
  let placeId: string
  if (params.placeId) {
    placeId = params.placeId
  } else if (params.address) {
    placeId = await getGooglePlaceIdFromAddress(params.address)
  } else {
    throw new Error('Either address or placeId must be provided')
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
      extra: { ...params, data },
      tags: {
        domain: 'swc-civic',
      },
    })
    throw new Error('No latitude and longitude found for address')
  }

  return data.location
}
