'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { isNil, noop } from 'lodash-es'
import { z } from 'zod'

import { LeaderboardRow } from '@/components/app/pageReferrals/leaderboard/row'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { Skeleton } from '@/components/ui/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useMutableCurrentUserAddress } from '@/hooks/useCurrentUserAddress'
import { useGetDistrictFromAddress } from '@/hooks/useGetDistrictFromAddress'
import { useGetDistrictRank } from '@/hooks/useGetDistrictRank'
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript'
import { StateCode } from '@/utils/server/districtRankings/types'
import { getCAProvinceOrTerritoryNameFromCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import {
  convertGooglePlaceAutoPredictionToAddressSchema,
  GooglePlaceAutocompletePrediction,
} from '@/utils/web/googlePlaceUtils'
import { zodAddress } from '@/validation/fields/zodAddress'

function Heading() {
  return (
    <div className="flex items-center justify-between">
      <p className="pl-4 text-lg font-bold">Your constituency</p>
      <p className="text-fontcolor-muted">Advocates</p>
    </div>
  )
}

function DefaultPlacesSelect(
  props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>,
) {
  return (
    <div className="w-full space-y-3">
      <p className="pl-4 text-lg font-bold">Your constituency</p>
      <GooglePlacesSelect
        className="rounded-full bg-gray-100 text-gray-600"
        placeholder="Enter your address"
        {...props}
      />
    </div>
  )
}

function ConstituencyNotFound(
  props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>,
) {
  return (
    <div className="space-y-3">
      <DefaultPlacesSelect {...props} />
      <p className="pl-4 text-sm text-fontcolor-muted">
        Constituency not found, please try a different address.
      </p>
    </div>
  )
}

interface CaYourConstituencyRankContentProps {
  provinceCode: StateCode
  constituency: string
  filteredByProvinceOrTerritory?: boolean
  address: 'loading' | GooglePlaceAutocompletePrediction | null
  setAddress: (p: GooglePlaceAutocompletePrediction | null) => void
}

const countryCode = SupportedCountryCodes.CA

function CaYourConstituencyRankContent(props: CaYourConstituencyRankContentProps) {
  const { provinceCode, constituency, filteredByProvinceOrTerritory, address, setAddress } = props

  const isLoadingAddress = address === 'loading'

  const constituencyRankingResponse = useGetDistrictRank({
    countryCode,
    stateCode: provinceCode,
    districtNumber: constituency,
    filteredByState: filteredByProvinceOrTerritory,
  })

  if (constituencyRankingResponse.isLoading) {
    return (
      <div className="space-y-3">
        <Heading />
        <Skeleton className="h-12 w-full bg-primary-cta/10" />
      </div>
    )
  }

  if (!constituencyRankingResponse.data) {
    return <ConstituencyNotFound onChange={setAddress} value={isLoadingAddress ? null : address} />
  }

  const count = constituencyRankingResponse.data.score
  const rank = constituencyRankingResponse.data.rank

  if (isNil(count) || isNil(rank)) {
    return null
  }

  return (
    <div className="space-y-3">
      <Heading />
      <LeaderboardRow
        count={count}
        locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
        rank={rank ?? 0}
        variant="highlight"
      >
        <LeaderboardRow.Label>{`${getCAProvinceOrTerritoryNameFromCode(provinceCode)} - ${constituency}`}</LeaderboardRow.Label>
      </LeaderboardRow>
    </div>
  )
}

export function CaSuspenseYourConstituencyRank({
  filteredByProvinceOrTerritory,
}: {
  filteredByProvinceOrTerritory?: boolean
}) {
  const profileResponse = useApiResponseForUserFullProfileInfo()
  const { setAddress, address: mutableAddress } = useMutableCurrentUserAddress()
  const [isAddressInCanada, setIsAddressInCanada] = useState<boolean>(false)
  const [addressDetails, setAddressDetails] = useState<
    z.infer<typeof zodAddress> | null | 'loading'
  >(null)
  const isLoadingAddress = profileResponse.isLoading || mutableAddress === 'loading'
  const { isLoaded: isGoogleMapsLoaded } = useGoogleMapsScript()

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

  const loadAddressDetails = useCallback(async () => {
    if (!address || !isGoogleMapsLoaded) return

    const addressDetailsResponse = await convertGooglePlaceAutoPredictionToAddressSchema(address)
    setAddressDetails(addressDetailsResponse)
    setIsAddressInCanada(addressDetailsResponse.countryCode.toLowerCase() === countryCode)
  }, [address, isGoogleMapsLoaded])

  useEffect(() => {
    void loadAddressDetails()
  }, [loadAddressDetails])

  const constituencyResponse = useGetDistrictFromAddress({
    address: address?.description,
    placeId: address?.place_id,
  })

  const constituency = useMemo(() => {
    if (!constituencyResponse.data) return null
    if ('notFoundReason' in constituencyResponse.data) return null
    if (!constituencyResponse.data.zoneName) return null
    return constituencyResponse.data
  }, [constituencyResponse.data])

  const provinceCode = useMemo<StateCode | null>(() => {
    if (constituency?.administrativeArea) return constituency.administrativeArea as StateCode
    if (addressDetails !== 'loading' && addressDetails?.administrativeAreaLevel1) {
      return addressDetails.administrativeAreaLevel1 as StateCode
    }
    return null
  }, [addressDetails, constituency?.administrativeArea])

  if (
    constituencyResponse.isLoading ||
    isLoadingAddress ||
    addressDetails === 'loading' ||
    !isGoogleMapsLoaded
  ) {
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

  if (!isAddressInCanada) {
    return (
      <div className="space-y-3">
        <DefaultPlacesSelect onChange={setAddress} value={isLoadingAddress ? null : address} />
        <p className="pl-4 text-sm text-fontcolor-muted">
          Looks like your address is not from Canada, so it can't be used to filter
        </p>
      </div>
    )
  }

  if (!constituency && !constituencyResponse.isLoading) {
    return <ConstituencyNotFound onChange={setAddress} value={address} />
  }

  if (!provinceCode || !constituency?.zoneName) {
    return <ConstituencyNotFound onChange={setAddress} value={address} />
  }

  return (
    <CaYourConstituencyRankContent
      address={mutableAddress}
      constituency={constituency.zoneName}
      filteredByProvinceOrTerritory={filteredByProvinceOrTerritory}
      provinceCode={provinceCode}
      setAddress={setAddress}
    />
  )
}

export function CaYourConstituencyRank({
  filteredByProvinceOrTerritory,
}: {
  filteredByProvinceOrTerritory?: boolean
}) {
  return (
    <Suspense fallback={<DefaultPlacesSelect loading onChange={noop} value={null} />}>
      <CaSuspenseYourConstituencyRank
        filteredByProvinceOrTerritory={filteredByProvinceOrTerritory}
      />
    </Suspense>
  )
}
