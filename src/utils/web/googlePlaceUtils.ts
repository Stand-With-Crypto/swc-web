import * as Sentry from '@sentry/nextjs'
import { isError } from 'lodash-es'
import pRetry from 'p-retry'
import { getDetails } from 'use-places-autocomplete'

import { formatGooglePlacesResultToAddress } from '@/utils/shared/formatGooglePlacesResultToAddress'
import { getLogger } from '@/utils/shared/logger'

const logger = getLogger('formatGooglePlacesResultToAddress')

export type GooglePlaceAutocompletePrediction = Pick<
  google.maps.places.AutocompletePrediction,
  'description' | 'place_id'
>

type GooglePlacesResponse = Required<
  Pick<google.maps.places.PlaceResult, 'address_components' | 'geometry'>
>

function isGoogleMapsReady() {
  console.log('----------------- isGoogleMapsReady')
  return pRetry(
    () => {
      if (
        google.maps &&
        google.maps.places &&
        typeof google.maps.places.PlacesService === 'function'
      ) {
        console.log('----------------- isGoogleMapsReady true')
        return true
      } else {
        console.log('----------------- isGoogleMapsReady false')
        throw new Error('Google Maps API not ready')
      }
    },
    {
      retries: 10,
      maxTimeout: 1000,
    },
  )
}

async function fetchAddressComponents(placeId: string) {
  await isGoogleMapsReady()

  return getDetails({
    placeId,
    fields: ['address_components', 'geometry'],
  }) as Promise<GooglePlacesResponse>
}

async function refreshPlaceId(placeId: string) {
  return getDetails({
    placeId,
    fields: ['place_id'],
  }) as Promise<Required<Pick<google.maps.places.PlaceResult, 'place_id'>>>
}

async function handleExpiredPlaceId(prediction: GooglePlaceAutocompletePrediction) {
  logger.error('Error fetching place details, attempting to refresh place_id')

  try {
    const refreshedPlace = await refreshPlaceId(prediction.place_id)
    const addressComponents = await fetchAddressComponents(refreshedPlace.place_id)
    return formatGooglePlacesResultToAddress({
      ...addressComponents,
      formattedDescription: prediction.description,
      placeId: refreshedPlace.place_id,
    })
  } catch (refreshError) {
    logger.error('Failed to refresh place_id:', refreshError)
    Sentry.captureException(refreshError, {
      tags: {
        domain: 'googlePlaceUtils/handleExpiredPlaceId',
        message: 'Failed to refresh place_id',
      },
      extra: {
        prediction,
      },
    })
    throw refreshError
  }
}

async function getAddressWithRetry(prediction: GooglePlaceAutocompletePrediction) {
  try {
    const addressComponents = await fetchAddressComponents(prediction.place_id)
    return formatGooglePlacesResultToAddress({
      ...addressComponents,
      formattedDescription: prediction.description,
      placeId: prediction.place_id,
    })
  } catch (error) {
    if (error === 'NOT_FOUND' || error === 'INVALID_REQUEST') {
      return await handleExpiredPlaceId(prediction)
    }
    throw isError(error) ? error : new Error(String(error))
  }
}

export async function convertGooglePlaceAutoPredictionToAddressSchema(
  prediction: GooglePlaceAutocompletePrediction,
) {
  try {
    return await getAddressWithRetry(prediction)
  } catch (error) {
    logger.error('Unexpected error fetching place details:', error)
    Sentry.captureException(error, {
      tags: {
        domain: 'googlePlaceUtils/convertGooglePlaceAutoPredictionToAddressSchema',
        message: 'Unexpected error fetching place details',
      },
      extra: {
        prediction,
      },
    })
    throw error
  }
}
