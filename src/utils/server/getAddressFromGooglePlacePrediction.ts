'use server'

import * as Sentry from '@sentry/nextjs'
import _isEmpty from 'lodash-es/isEmpty'

import { fetchReq } from '@/utils/shared/fetchReq'
import { formatGooglePlacesResultToAddress } from '@/utils/shared/formatGooglePlacesResultToAddress'
import { requiredEnv } from '@/utils/shared/requiredEnv'

const GOOGLE_PLACES_TEXT_SEARCH_API_URL = 'https://places.googleapis.com/v1/places:searchText'
const GOOGLE_PLACES_DETAILS_API_URL = 'https://places.googleapis.com/v1/places'
const GOOGLE_PLACES_BACKEND_API_KEY = requiredEnv(
  process.env.GOOGLE_PLACES_BACKEND_API_KEY,
  'GOOGLE_PLACES_BACKEND_API_KEY',
)

interface AddressComponent {
  longText: string
  shortText: string
  types: string[]
  languageCode: string
}

interface PlaceData {
  placeId: string
  formattedAddress: string
  addressComponents: AddressComponent[]
  location: {
    latitude: number
    longitude: number
  }
}

type Args =
  | {
      address: string
      placeId?: string
    }
  | {
      placeId: string
      address?: string
    }

/**
 * Fetches place data from an address or place ID
 * @param address - The address to search for
 * @param placeId - The place ID to search for
 * @returns Place data with ID, formatted address, address components, and location
 * @throws Error if no place is found or if the API request fails
 */
export async function getPlaceDataFromAddress({ address, placeId }: Args): Promise<PlaceData> {
  let data: GooglePlacesDetailsResponse | undefined
  let response: Response
  if (placeId) {
    response = await fetchDataByPlaceId(placeId)
    data = (await response.json()) as GooglePlacesDetailsResponse
  } else if (address) {
    response = await fetchDataByAddress(address)
    data = ((await response.json()) as GooglePlacesTextSearchResponse).places?.[0]
  } else {
    throw new Error('Either address or placeId must be provided')
  }

  if (!response.ok) {
    const errorText = await response.text()
    Sentry.captureException(
      new Error(`Google Places Search API request failed: ${response.status} ${errorText}`),
      {
        extra: { address },
      },
    )
    throw new Error(`Failed to search for place: ${response.status}`)
  }

  if (_isEmpty(data) || !data) {
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

  return {
    placeId: data.id,
    formattedAddress: data.formattedAddress,
    addressComponents: data.addressComponents,
    location: {
      latitude: data.location.latitude,
      longitude: data.location.longitude,
    },
  }
}

interface GooglePlacesTextSearchResponse {
  places?: Array<{
    id: string
    formattedAddress: string
    addressComponents: AddressComponent[]
    location: {
      latitude: number
      longitude: number
    }
  }>
}

interface GooglePlacesTextSearchRequest {
  textQuery: string
  languageCode?: string
}

async function fetchDataByAddress(address: string) {
  const requestBody: GooglePlacesTextSearchRequest = {
    textQuery: address,
  }
  return await fetchReq(GOOGLE_PLACES_TEXT_SEARCH_API_URL, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_PLACES_BACKEND_API_KEY,
      'X-Goog-FieldMask':
        'places.id,places.formattedAddress,places.location,places.addressComponents',
    },
  })
}

interface GooglePlacesDetailsResponse {
  id: string
  formattedAddress: string
  addressComponents: AddressComponent[]
  location: {
    latitude: number
    longitude: number
  }
}

async function fetchDataByPlaceId(placeId: string) {
  return await fetchReq(`${GOOGLE_PLACES_DETAILS_API_URL}/${placeId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_PLACES_BACKEND_API_KEY,
      'X-Goog-FieldMask': 'id,formattedAddress,location,addressComponents',
    },
  })
}

export async function getAddressFromGooglePlacePrediction(
  prediction: Partial<google.maps.places.AutocompletePrediction> & { description: string },
) {
  const result = await getPlaceDataFromAddress({
    address: prediction.description,
    placeId: prediction.place_id,
  })
  return formatGooglePlacesResultToAddress({
    address_components: result.addressComponents.map(component => ({
      ...component,
      long_name: component.longText,
      short_name: component.shortText,
    })),
    geometry: {
      location: {
        lat: () => result.location.latitude,
        lng: () => result.location.longitude,
      },
    } as google.maps.places.PlaceGeometry,
    placeId: result.placeId,
    formattedDescription: result.formattedAddress,
  })
}
