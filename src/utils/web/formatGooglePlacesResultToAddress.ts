import { zodAddress } from '@/validation/fields/zodAddress'
import { infer, z } from 'zod'

export const formatGooglePlacesResultToAddress = (
  result: Required<Pick<google.maps.places.PlaceResult, 'address_components'>> & {
    placeId: string
    formattedDescription: string
  },
): z.infer<typeof zodAddress> => {
  const { address_components: addressComponents, formattedDescription, placeId } = result
  return {
    googlePlaceId: placeId,
    formattedDescription: formattedDescription,
    streetNumber: addressComponents.find(x => x.types.includes('street_number'))?.long_name || '',
    route: addressComponents.find(x => x.types.includes('route'))?.long_name || '',
    subpremise: addressComponents.find(x => x.types.includes('subpremise'))?.long_name || '',
    locality: addressComponents.find(x => x.types.includes('locality'))?.long_name || '',
    administrativeAreaLevel1:
      addressComponents.find(x => x.types.includes('administrative_area_level1'))?.short_name || '',
    administrativeAreaLevel2:
      addressComponents.find(x => x.types.includes('administrative_area_level2'))?.long_name || '',
    postalCode: addressComponents.find(x => x.types.includes('postal_code'))?.long_name || '',
    postalCodeSuffix:
      addressComponents.find(x => x.types.includes('postal_code_suffix'))?.long_name || '',
    countryCode: addressComponents.find(x => x.types.includes('country'))!.short_name,
  }
}
