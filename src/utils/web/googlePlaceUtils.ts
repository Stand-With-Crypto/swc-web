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

export async function convertGooglePlaceAutoPredictionToAddressSchema(
  prediction: GooglePlaceAutocompletePrediction,
) {
  const unCastResult = await getDetails({
    placeId: prediction.place_id,
    fields: ['address_components'],
  })
  const result = unCastResult as Required<
    Pick<google.maps.places.PlaceResult, 'address_components'>
  >
  return formatGooglePlacesResultToAddress({
    ...result,
    formattedDescription: prediction.description,
    placeId: prediction.place_id,
  })
}
