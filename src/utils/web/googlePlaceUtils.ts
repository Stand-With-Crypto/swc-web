import * as Sentry from '@sentry/nextjs'
import { getDetails } from 'use-places-autocomplete'
import { z } from 'zod'

import { getLogger } from '@/utils/shared/logger'
import { zodAddress } from '@/validation/fields/zodAddress'

const logger = getLogger('formatGooglePlacesResultToAddress')

export type GooglePlaceAutocompletePrediction = Pick<
  google.maps.places.AutocompletePrediction,
  'description' | 'place_id'
>

const formatGooglePlacesResultToAddress = (
  result: Required<Pick<google.maps.places.PlaceResult, 'address_components'>> & {
    placeId: string
    formattedDescription: string
  },
): z.infer<typeof zodAddress> => {
  const { address_components: addressComponents, formattedDescription, placeId } = result
  logger.info('normalizing google place result', result)
  return {
    googlePlaceId: placeId,
    formattedDescription: formattedDescription,
    streetNumber: addressComponents.find(x => x.types.includes('street_number'))?.long_name || '',
    route: addressComponents.find(x => x.types.includes('route'))?.long_name || '',
    subpremise: addressComponents.find(x => x.types.includes('subpremise'))?.long_name || '',
    locality: addressComponents.find(x => x.types.includes('locality'))?.long_name || '',
    administrativeAreaLevel1:
      addressComponents.find(x => x.types.includes('administrative_area_level_1'))?.short_name ||
      '',
    administrativeAreaLevel2:
      addressComponents.find(x => x.types.includes('administrative_area_level_2'))?.long_name || '',
    postalCode: addressComponents.find(x => x.types.includes('postal_code'))?.long_name || '',
    postalCodeSuffix:
      addressComponents.find(x => x.types.includes('postal_code_suffix'))?.long_name || '',
    countryCode: addressComponents.find(x => x.types.includes('country'))!.short_name,
  }
}

async function fetchAddressComponents(placeId: string) {
  return getDetails({
    placeId,
    fields: ['address_components'],
  }) as Promise<Required<Pick<google.maps.places.PlaceResult, 'address_components'>>>
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
    throw error
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
