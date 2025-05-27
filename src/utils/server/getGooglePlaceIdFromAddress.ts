import * as Sentry from '@sentry/nextjs'
import _isEmpty from 'lodash-es/isEmpty'

import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const GOOGLE_PLACES_API_URL = 'https://places.googleapis.com/v1/places:autocomplete'
const GOOGLE_PLACES_BACKEND_API_KEY = requiredEnv(
  process.env.GOOGLE_PLACES_BACKEND_API_KEY,
  'GOOGLE_PLACES_BACKEND_API_KEY',
)

interface GooglePlacesResponse {
  suggestions?: Array<{
    placePrediction: {
      placeId: string
    }
  }>
}

interface GooglePlacesRequest {
  input: string
  languageCode: string
}

/**
 * Fetches a Google Place ID for a given address using the Google Places API
 * @param address - The address to get the place ID for
 * @returns The Google Place ID
 * @throws Error if no place ID is found or if the API request fails
 */
export async function getGooglePlaceIdFromAddress(address: string): Promise<string> {
  try {
    const requestBody: GooglePlacesRequest = {
      input: address,
      languageCode: 'en',
    }

    const response = await fetchReq(GOOGLE_PLACES_API_URL, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_BACKEND_API_KEY,
        'X-Goog-FieldMask': 'suggestions.placePrediction.placeId',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Google Places autocomplete API request failed: ${response.status} ${errorText}`,
      )
    }

    const data = (await response.json()) as GooglePlacesResponse

    if (_isEmpty(data) || !data?.suggestions || data?.suggestions?.length === 0) {
      const error = new Error('No place ID found for address')
      Sentry.captureMessage('getGooglePlaceIdFromAddress no results for the address', {
        extra: {
          address,
          data,
          status: response.status,
          statusText: response.statusText,
        },
      })
      throw error
    }

    return data.suggestions[0].placePrediction.placeId
  } catch (error) {
    Sentry.captureException(error, {
      extra: { address },
    })
    throw error
  }
}
