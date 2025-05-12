'use client'
import { useCallback, useEffect } from 'react'

import { SearchError, StateSearchProps } from '@/components/app/pageLocalPolicy/types'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import {
  convertGooglePlaceAutoPredictionToAddressSchema,
  GooglePlaceAutocompletePrediction,
} from '@/utils/web/googlePlaceUtils'

export function StateSearchComponent({
  countryCode,
  setSearchError,
  setSearchResult,
}: StateSearchProps) {
  const { address, setAddress } = useMutableCurrentUserAddress()

  const triggerError = useCallback(
    (error: SearchError) => {
      setSearchError(error)
      setSearchResult(null)
    },
    [setSearchError, setSearchResult],
  )

  const onChangeAddress = useCallback(
    async (prediction: GooglePlaceAutocompletePrediction | null) => {
      if (!prediction) {
        setAddress(null)
        return
      }

      const details = await convertGooglePlaceAutoPredictionToAddressSchema(prediction)

      if (details.countryCode.toLowerCase() !== countryCode) {
        return triggerError('COUNTRY_NOT_SUPPORTED')
      }

      if (!details.administrativeAreaLevel1) {
        return triggerError('STATE_NOT_FOUND')
      }

      setSearchError(null)
      setSearchResult(details)
    },
    [countryCode, setAddress, setSearchError, setSearchResult, triggerError],
  )

  useEffect(() => {
    if (address === 'loading') {
      return
    }

    void onChangeAddress(address)
  }, [address, onChangeAddress])

  return (
    <div className="mx-auto w-full max-w-[562px]">
      <GooglePlacesSelect
        className="bg-backgroundAlternate"
        loading={address === 'loading'}
        onChange={setAddress}
        placeholder="Enter your address"
        value={address !== 'loading' ? address : null}
      />
    </div>
  )
}
