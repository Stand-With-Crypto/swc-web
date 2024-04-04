import { useEffect, useMemo } from 'react'
import usePlacesAutocomplete from 'use-places-autocomplete'

import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript'

const CALLBACK_NAME = 'PLACES_AUTOCOMPLETE'

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
      locationBias: 'IP_BIAS',
      language: 'en',
    },
  })

  const scriptStatus = useGoogleMapsScript(CALLBACK_NAME)

  useEffect(() => {
    if (scriptStatus === 'ready') {
      init()
      if (address) {
        // Setting the value will trigger fetching the address suggestions
        setValue(address)
      }
    }
  }, [address, init, scriptStatus, setValue])

  return useMemo(() => ({ addressSuggestions, ready }), [addressSuggestions, ready])
}
