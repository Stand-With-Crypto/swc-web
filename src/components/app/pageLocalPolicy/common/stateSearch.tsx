'use client'
import { Suspense, useCallback, useEffect } from 'react'
import { noop } from 'lodash-es'

import { SearchErrorCode, SearchResult } from '@/components/app/pageLocalPolicy/common/types'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import {
  convertGooglePlaceAutoPredictionToAddressSchema,
  GooglePlaceAutocompletePrediction,
} from '@/utils/web/googlePlaceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface StateSearchProps {
  countryCode: SupportedCountryCodes
  setSearchErrorCode: React.Dispatch<React.SetStateAction<SearchErrorCode>>
  setSearchResult: React.Dispatch<React.SetStateAction<SearchResult>>
}

function PlacesSelect(
  props: Required<Pick<GooglePlacesSelectProps, 'loading' | 'onChange' | 'value'>>,
) {
  return (
    <div className="mx-auto w-full max-w-[562px]">
      <GooglePlacesSelect
        className="bg-backgroundAlternate"
        placeholder="Enter your address"
        {...props}
      />
    </div>
  )
}

function SuspenseStateSearch({
  countryCode,
  setSearchErrorCode,
  setSearchResult,
}: StateSearchProps) {
  const { address, setAddress } = useMutableCurrentUserAddress()

  const isAddressLoading = address === 'loading'

  const onChangeAddress = useCallback(
    async (prediction: GooglePlaceAutocompletePrediction | null) => {
      if (!prediction) {
        setAddress(null)
        return
      }

      const details = await convertGooglePlaceAutoPredictionToAddressSchema(prediction)

      if (details.countryCode.toLowerCase() !== countryCode) {
        setSearchErrorCode('COUNTRY_NOT_SUPPORTED')
        setSearchResult(null)
        return
      }

      if (!details.administrativeAreaLevel1) {
        setSearchErrorCode('STATE_NOT_FOUND')
        setSearchResult(null)
        return
      }

      setSearchErrorCode(null)
      setSearchResult(details)
    },
    [countryCode, setAddress, setSearchErrorCode, setSearchResult],
  )

  useEffect(() => {
    if (isAddressLoading) {
      return
    }

    void onChangeAddress(address)
  }, [address, onChangeAddress])

  return (
    <PlacesSelect
      loading={isAddressLoading}
      onChange={setAddress}
      value={isAddressLoading ? null : address}
    />
  )
}

export function StateSearch(props: StateSearchProps) {
  return (
    <Suspense fallback={<PlacesSelect loading onChange={noop} value={null} />}>
      <SuspenseStateSearch {...props} />
    </Suspense>
  )
}
