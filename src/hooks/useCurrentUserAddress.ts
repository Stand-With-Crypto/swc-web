'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useLocalUser } from '@/hooks/useLocalUser'
import { usePlacesAutocompleteAddress } from '@/hooks/usePlacesAutocompleteAddress'
import { setLocalUserPersistedValues } from '@/utils/web/clientLocalUser'
import { GooglePlaceAutocompletePrediction } from '@/utils/web/googlePlaceUtils'

function useMaybeUseSearchParamAddress() {
  const searchParams = useSearchParams()
  const addressParam = searchParams?.get('address') ?? ''
  const { ready, addressSuggestions, loading } = usePlacesAutocompleteAddress(
    decodeURIComponent(addressParam),
  )
  if (!searchParams || (addressParam && (!ready || loading))) {
    return 'loading' as const
  }
  return addressSuggestions.length
    ? {
        description: addressSuggestions[0].description,
        place_id: addressSuggestions[0].place_id,
      }
    : null
}

function useCurrentUserAddress() {
  const searchParamAddressData = useMaybeUseSearchParamAddress()
  const user = useApiResponseForUserFullProfileInfo()
  const hasHydrated = useHasHydrated()
  const localUser = useLocalUser()
  const localUserAddress = localUser.persisted?.recentlyUsedAddress && {
    description: localUser.persisted.recentlyUsedAddress.formattedDescription,
    place_id: localUser.persisted.recentlyUsedAddress.googlePlaceId,
  }
  const persistedUserAddress = user.data?.user?.address && {
    description: user.data.user.address.formattedDescription,
    place_id: user.data.user.address.googlePlaceId,
  }
  if (searchParamAddressData === 'loading' || user.isLoading || !hasHydrated) {
    return 'loading' as const
  }
  const address = searchParamAddressData || localUserAddress || persistedUserAddress || null
  return address
}

export function useMutableCurrentUserAddress() {
  const currentUserAddress = useCurrentUserAddress()
  const [address, _setAddress] = useState(currentUserAddress)
  const initialAddress = useRef<typeof currentUserAddress | 'not-set'>(address)
  const setAddress = useCallback(
    (addr: GooglePlaceAutocompletePrediction | null) => {
      setLocalUserPersistedValues({
        recentlyUsedAddress: addr
          ? {
              googlePlaceId: addr.place_id,
              formattedDescription: addr.description,
            }
          : undefined,
      })
      _setAddress(addr)
    },
    [_setAddress],
  )

  useEffect(() => {
    if (
      currentUserAddress !== 'loading' &&
      (!initialAddress.current || initialAddress.current === 'loading')
    ) {
      initialAddress.current = currentUserAddress || 'not-set'
      if (currentUserAddress) {
        setAddress(currentUserAddress)
      }
    }
  }, [currentUserAddress, setAddress])
  return { address, setAddress }
}
