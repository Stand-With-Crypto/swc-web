'use client'

import { Suspense } from 'react'
import { isNil, noop } from 'lodash-es'

import { GetDistrictRankResponse } from '@/app/api/public/referrals/[countryCode]/[stateCode]/[districtNumber]/route'
import { LeaderboardRow } from '@/components/app/pageReferrals/common/leaderboard/row'
import { useUserAddress } from '@/components/app/pageReferrals/common/userAddress.context'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { Skeleton } from '@/components/ui/skeleton'
import { useCountryCode } from '@/hooks/useCountryCode'
import { StateCode } from '@/utils/server/districtRankings/types'
import { getUSStateNameFromStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { COUNTRY_CODE_TO_LOCALE } from '@/utils/shared/supportedCountries'
import { GooglePlaceAutocompletePrediction } from '@/utils/web/googlePlaceUtils'

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

interface UsYourDistrictRankContentProps {
  stateCode: StateCode
  districtNumber: string
  address: 'loading' | GooglePlaceAutocompletePrediction | null
  setAddress: (p: GooglePlaceAutocompletePrediction | null) => void
  isLoading: boolean
  districtRanking: GetDistrictRankResponse | null
}

function UsYourDistrictRankContent(props: UsYourDistrictRankContentProps) {
  const { stateCode, districtNumber, districtRanking, isLoading, address, setAddress } = props
  const countryCode = useCountryCode()

  const isLoadingAddress = address === 'loading'

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Heading />
        <Skeleton className="h-12 w-full bg-primary-cta/10" />
      </div>
    )
  }

  if (!districtRanking) {
    return <DistrictNotFound onChange={setAddress} value={isLoadingAddress ? null : address} />
  }

  const count = districtRanking.score
  const rank = districtRanking.rank

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
        <LeaderboardRow.Label>{`${getUSStateNameFromStateCode(stateCode)} - District ${districtNumber}`}</LeaderboardRow.Label>
      </LeaderboardRow>
    </div>
  )
}

export function UsYourDistrictRank() {
  const {
    address,
    setMutableAddress: setAddress,
    mutableAddress,
    isAddressInCountry: isAddressInUS,
    isLoading,
    electoralZone: district,
    electoralZoneRanking: districtRanking,
    administrativeArea: stateCode,
  } = useUserAddress()

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Heading />
        <Skeleton className="h-12 w-full bg-primary-cta/10" />
      </div>
    )
  }

  if (!address) {
    return (
      <DefaultPlacesSelect
        loading={isLoading}
        onChange={setAddress}
        value={mutableAddress === 'loading' ? null : mutableAddress}
      />
    )
  }

  if (!isAddressInUS) {
    return (
      <div className="space-y-3">
        <DefaultPlacesSelect onChange={setAddress} value={isLoading ? null : address} />
        <p className="pl-4 text-sm text-fontcolor-muted">
          Looks like your address is not from the United States, so it can't be used to filter
        </p>
      </div>
    )
  }

  if (!district) {
    return <DistrictNotFound onChange={setAddress} value={address} />
  }

  if (!stateCode || !district?.zoneName) {
    return <DistrictNotFound onChange={setAddress} value={address} />
  }

  return (
    <UsYourDistrictRankContent
      address={mutableAddress}
      districtNumber={district.zoneName}
      districtRanking={districtRanking}
      isLoading={isLoading}
      setAddress={setAddress}
      stateCode={stateCode}
    />
  )
}

export function UsYourDistrictRankSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<DefaultPlacesSelect loading onChange={noop} value={null} />}>
      {children}
    </Suspense>
  )
}
