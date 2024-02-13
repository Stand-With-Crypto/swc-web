import { useEffect, useMemo } from 'react'
import usePlacesAutocomplete from 'use-places-autocomplete'

import { useScript } from '@/hooks/useScript'
import { isBrowser } from '@/utils/shared/executionEnvironment'
import { requiredEnv } from '@/utils/shared/requiredEnv'
import { LAT_LONG_FOR_CENTER_OF_US, WIDTH_OF_US_METERS } from '@/utils/web/googlePlaceConstants'

const CALLBACK_NAME = 'PLACES_AUTOCOMPLETE'

const NEXT_PUBLIC_GOOGLE_PLACES_API_KEY = requiredEnv(
  process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
  'NEXT_PUBLIC_GOOGLE_PLACES_API_KEY',
)

/**
 * Wraps `usePlacesAutocomplete` to fetch the suggestions for a given address without relying on user input
 */
export function usePlacesAutocompleteAddress(address: string) {
  const {
    suggestions: { data: addressSuggestions },
    init,
    setValue,
    ready,
  } = usePlacesAutocomplete({
    callbackName: CALLBACK_NAME,
    // note on why we aren't restricting to just addresses https://stackoverflow.com/a/65206036
    requestOptions: {
      locationBias:
        isBrowser && window.google
          ? new google.maps.Circle({
              center: LAT_LONG_FOR_CENTER_OF_US,
              radius: WIDTH_OF_US_METERS / 2,
            })
          : undefined,
    },
    defaultValue: address,
  })

  const scriptStatus = useScript(
    `https://maps.googleapis.com/maps/api/js?key=${NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&callback=${CALLBACK_NAME}`,
  )

  useEffect(() => {
    if (scriptStatus === 'ready') {
      init()
      if (address) {
        setValue(address)
      }
    }
  }, [address, init, scriptStatus, setValue])

  return useMemo(() => ({ addressSuggestions, ready }), [addressSuggestions, ready])
}
