import * as Sentry from '@sentry/nextjs'
import _isEmpty from 'lodash-es/isEmpty'

import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const GOOGLE_PLACES_TEXT_SEARCH_API_URL = 'https://places.googleapis.com/v1/places:searchText'
const GOOGLE_PLACES_BACKEND_API_KEY = requiredEnv(
  process.env.GOOGLE_PLACES_BACKEND_API_KEY,
  'GOOGLE_PLACES_BACKEND_API_KEY',
)

type AddressComponents = google.maps.GeocoderAddressComponent[]

interface GooglePlacesTextSearchResponse {
  places?: Array<{
    id: string
    formattedAddress?: string
    addressComponents?: AddressComponents
    location?: {
      latitude: number
      longitude: number
    }
  }>
}

interface GooglePlacesTextSearchRequest {
  textQuery: string
  languageCode?: string
}

export interface PlaceData {
  placeId: string
  formattedAddress: string
  addressComponents: AddressComponents
  location: {
    latitude: number
    longitude: number
  }
}

/**
 * Fetches place data including both place ID and location coordinates from an address
 * using the Google Places Text Search API in a single request
 * @param address - The address to search for
 * @returns Place data with ID, name, address, and coordinates
 * @throws Error if no place is found or if the API request fails
 */
export async function getPlaceDataFromAddress(address: string): Promise<PlaceData> {
  const requestBody: GooglePlacesTextSearchRequest = {
    textQuery: address,
    languageCode: 'en',
  }

  const response = await fetchReq(GOOGLE_PLACES_TEXT_SEARCH_API_URL, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_PLACES_BACKEND_API_KEY,
      'X-Goog-FieldMask':
        'places.id,places.formattedAddress,places.location,places.addressComponents',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    Sentry.captureException(
      new Error(`Google Places Text Search API request failed: ${response.status} ${errorText}`),
      {
        extra: { address },
      },
    )
    throw new Error(`Failed to search for place: ${response.status}`)
  }

  const data = (await response.json()) as GooglePlacesTextSearchResponse

  if (_isEmpty(data) || !data?.places || data?.places?.length === 0) {
    Sentry.captureMessage('getPlaceDataFromAddress no results for the address', {
      extra: {
        address,
        data,
        status: response.status,
        statusText: response.statusText,
      },
      level: 'info',
    })
    throw new Error('No place found for address')
  }

  const firstPlace = data.places[0]

  if (!firstPlace.location) {
    throw new Error('No location data found for place')
  }

  return {
    placeId: firstPlace.id,
    formattedAddress: firstPlace.formattedAddress || '',
    addressComponents: firstPlace.addressComponents || [],
    location: {
      latitude: firstPlace.location.latitude,
      longitude: firstPlace.location.longitude,
    },
  }
}
