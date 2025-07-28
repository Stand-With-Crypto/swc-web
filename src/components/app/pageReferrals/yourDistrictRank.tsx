'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { isNil, noop } from 'lodash-es'

import { DistrictsLeaderboardRow } from '@/components/app/pageReferrals/districtsLeaderboardRow'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { useGetDistrictFromAddress } from '@/hooks/useGetDistrictFromAddress'
import { useGetDistrictRank } from '@/hooks/useGetDistrictRank'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  convertGooglePlaceAutoPredictionToAddressSchema,
  GooglePlaceAutocompletePrediction,
} from '@/utils/web/googlePlaceUtils'

function Heading() {
  return (
    <div className="flex items-center justify-between">
      <p className="pl-4 text-lg font-bold">Your district</p>
      <p className="text-fontcolor-muted">Advocates</p>
    </div>
  )
}

function DefaultPlacesSelect(
  props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>,
) {
  return (
    <div className="w-full space-y-3">
      <p className="pl-4 text-lg font-bold">Your district</p>
      <GooglePlacesSelect
        className="rounded-full bg-gray-100 text-gray-600"
        placeholder="Enter your address"
        {...props}
      />
    </div>
  )
}

function DistrictNotFound(props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>) {
  return (
    <div className="space-y-3">
      <DefaultPlacesSelect {...props} />
      <p className="pl-4 text-sm text-fontcolor-muted">
        District not found, please try a different address.
      </p>
    </div>
  )
}

interface YourDistrictRankContentProps {
  stateCode: USStateCode
  districtNumber: string
  filteredByState?: boolean
  address: 'loading' | GooglePlaceAutocompletePrediction | null
  setAddress: (p: GooglePlaceAutocompletePrediction | null) => void
}

function YourDistrictRankContent(props: YourDistrictRankContentProps) {
  const { stateCode, districtNumber, filteredByState, address, setAddress } = props
  const countryCode = useCountryCode()

  const isLoadingAddress = address === 'loading'

  const districtRankingResponse = useGetDistrictRank({
    stateCode,
    districtNumber,
    filteredByState,
  })

  if (districtRankingResponse.isLoading) {
    return (
      <div className="space-y-3">
        <Heading />
        <Skeleton className="h-12 w-full bg-primary-cta/10" />
      </div>
    )
  }

  if (!districtRankingResponse.data) {
    return <DistrictNotFound onChange={setAddress} value={isLoadingAddress ? null : address} />
  }

  const count = districtRankingResponse.data.score
  const rank = districtRankingResponse.data.rank

  if (isNil(count) || isNil(rank)) {
    return null
  }

  return (
    <div className="space-y-3">
      <Heading />
      <DistrictsLeaderboardRow
        count={count}
        district={districtNumber ?? ''}
        locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
        rank={rank ?? 0}
        state={stateCode}
        variant="highlight"
      />
    </div>
  )
}

export function SuspenseYourDistrictRank({ filteredByState }: { filteredByState?: boolean }) {
  const profileResponse = useApiResponseForUserFullProfileInfo()
  const { setAddress, address: mutableAddress } = useMutableCurrentUserAddress()
  const [isUSAddress, setIsUSAddress] = useState<boolean | 'loading'>(false)
  const isLoadingAddress = profileResponse.isLoading || mutableAddress === 'loading'

  const address = useMemo(() => {
    if (isLoadingAddress) return null
    if (profileResponse.data?.user?.address) {
      return {
        description: profileResponse.data.user.address.formattedDescription,
        place_id: profileResponse.data.user.address.googlePlaceId,
      }
    }
    if (mutableAddress) return mutableAddress
    return null
  }, [isLoadingAddress, mutableAddress, profileResponse.data?.user?.address])

  const checkIfUSAddress = useCallback(async () => {
    if (isLoadingAddress || !address) {
      setIsUSAddress(true)
      return
    }
    setIsUSAddress('loading')
    try {
      const addressDetails = await convertGooglePlaceAutoPredictionToAddressSchema(address)
      setIsUSAddress(addressDetails.countryCode.toLowerCase() === SupportedCountryCodes.US)
    } catch {
      setIsUSAddress(true)
    }
  }, [isLoadingAddress, address])
  useEffect(() => {
    void checkIfUSAddress()
  }, [checkIfUSAddress])

  const districtResponse = useGetDistrictFromAddress({
    address: address?.description,
    placeId: address?.place_id,
  })

  const district = useMemo(() => {
    if (!districtResponse.data) return null
    if ('notFoundReason' in districtResponse.data) return null
    if (!districtResponse.data.zoneName) return null
    return districtResponse.data
  }, [districtResponse.data])

  if (districtResponse.isLoading || isLoadingAddress || isUSAddress === 'loading') {
    return (
      <div className="space-y-3">
        <Heading />
        <Skeleton className="h-12 w-full bg-primary-cta/10" />
      </div>
    )
  }

  if (!address && !isLoadingAddress) {
    return (
      <DefaultPlacesSelect
        loading={isLoadingAddress}
        onChange={setAddress}
        value={mutableAddress}
      />
    )
  }

  if (!isUSAddress) {
    return (
      <div className="space-y-3">
        <DefaultPlacesSelect onChange={setAddress} value={isLoadingAddress ? null : address} />
        <p className="pl-4 text-sm text-fontcolor-muted">
          Looks like your address is outside the U.S., so it's not part of any district here.
        </p>
      </div>
    )
  }

  if (!district && !districtResponse.isLoading) {
    return <DistrictNotFound onChange={setAddress} value={address} />
  }

  if (!district?.administrativeArea || !district?.zoneName) {
    return <DistrictNotFound onChange={setAddress} value={address} />
  }

  return (
    <YourDistrictRankContent
      address={mutableAddress}
      districtNumber={district.zoneName}
      filteredByState={filteredByState}
      setAddress={setAddress}
      stateCode={district.administrativeArea as USStateCode}
    />
  )
}

export function YourDistrictRank({ filteredByState }: { filteredByState?: boolean }) {
  return (
    <Suspense fallback={<DefaultPlacesSelect loading onChange={noop} value={null} />}>
      <SuspenseYourDistrictRank filteredByState={filteredByState} />
    </Suspense>
  )
}
