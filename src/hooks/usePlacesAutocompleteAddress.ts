import { useEffect, useMemo } from 'react'
import usePlacesAutocomplete from 'use-places-autocomplete'

import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript'

/**
 * Wraps `usePlacesAutocomplete` to fetch the suggestions for a given address without relying on user input
 */
export function usePlacesAutocompleteAddress(address: string) {
  const {
    suggestions: { data: addressSuggestions, status },
    init,
    setValue,
    ready,
  } = usePlacesAutocomplete({
    // note on why we aren't restricting to just addresses https://stackoverflow.com/a/65206036
    requestOptions: {
      locationBias: 'IP_BIAS',
      language: 'en',
    },
    initOnMount: false,
  })
  // the library returns a loading prop but it appears to always be false. Status will be an empty string unless it returns something
  const loading = !status

  const { isLoaded } = useGoogleMapsScript()

  useEffect(() => {
    if (isLoaded) {
      init()
      if (address) {
        // Setting the value will trigger fetching the address suggestions
        setValue(address)
      }
    }
  }, [address, init, isLoaded, setValue])

  return useMemo(
    () => ({ addressSuggestions, ready, loading }),
    [addressSuggestions, loading, ready],
  )
}
