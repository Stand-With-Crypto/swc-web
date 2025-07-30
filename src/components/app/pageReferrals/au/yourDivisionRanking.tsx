'use client'

import { Suspense } from 'react'
import { isNil, noop } from 'lodash-es'

import { GetDistrictRankResponse } from '@/app/api/public/referrals/[countryCode]/[stateCode]/[districtNumber]/route'
import { LeaderboardRow } from '@/components/app/pageReferrals/leaderboard/row'
import { useUserAddress } from '@/components/app/pageReferrals/userAddress.context'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { Skeleton } from '@/components/ui/skeleton'
import { StateCode } from '@/utils/server/districtRankings/types'
import { getAUStateNameFromStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { GooglePlaceAutocompletePrediction } from '@/utils/web/googlePlaceUtils'

function Heading() {
  return (
    <div className="flex items-center justify-between">
      <p className="pl-4 text-lg font-bold">Your division</p>
      <p className="text-fontcolor-muted">Advocates</p>
    </div>
  )
}

function DefaultPlacesSelect(
  props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>,
) {
  return (
    <div className="w-full space-y-3">
      <p className="pl-4 text-lg font-bold">Your division</p>
      <GooglePlacesSelect
        className="rounded-full bg-gray-100 text-gray-600"
        placeholder="Enter your address"
        {...props}
      />
    </div>
  )
}

function DivisionNotFound(props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>) {
  return (
    <div className="space-y-3">
      <DefaultPlacesSelect {...props} />
      <p className="pl-4 text-sm text-fontcolor-muted">
        Division not found, please try a different address.
      </p>
    </div>
  )
}

interface AuYourDivisionRankContentProps {
  stateCode: StateCode
  division: string
  filteredByState?: boolean
  address: 'loading' | GooglePlaceAutocompletePrediction | null
  setAddress: (p: GooglePlaceAutocompletePrediction | null) => void
  isLoading: boolean
  divisionRanking: GetDistrictRankResponse | null
}

const countryCode = SupportedCountryCodes.AU

function AuYourDivisionRankContent(props: AuYourDivisionRankContentProps) {
  const { stateCode, division, address, setAddress, isLoading, divisionRanking } = props

  const isLoadingAddress = address === 'loading'

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Heading />
        <Skeleton className="h-12 w-full bg-primary-cta/10" />
      </div>
    )
  }

  if (!divisionRanking) {
    return <DivisionNotFound onChange={setAddress} value={isLoadingAddress ? null : address} />
  }

  const count = divisionRanking.score
  const rank = divisionRanking.rank

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
        <LeaderboardRow.Label>{`${getAUStateNameFromStateCode(stateCode)} - ${division}`}</LeaderboardRow.Label>
      </LeaderboardRow>
    </div>
  )
}

export function AuSuspenseYourDivisionRank() {
  const {
    address,
    setMutableAddress: setAddress,
    mutableAddress,
    isAddressInCountry: isAddressInAustralia,
    isLoading,
    electoralZone: division,
    electoralZoneRanking: divisionRanking,
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

  if (!isAddressInAustralia) {
    return (
      <div className="space-y-3">
        <DefaultPlacesSelect onChange={setAddress} value={isLoading ? null : address} />
        <p className="pl-4 text-sm text-fontcolor-muted">
          Looks like your address is not from Australia, so it can't be used to filter
        </p>
      </div>
    )
  }

  if (!division) {
    return <DivisionNotFound onChange={setAddress} value={address} />
  }

  if (!stateCode || !division?.zoneName) {
    return <DivisionNotFound onChange={setAddress} value={address} />
  }

  return (
    <AuYourDivisionRankContent
      address={mutableAddress}
      division={division.zoneName}
      divisionRanking={divisionRanking}
      isLoading={isLoading}
      setAddress={setAddress}
      stateCode={stateCode}
    />
  )
}

export function AuYourDivisionRank() {
  return (
    <Suspense fallback={<DefaultPlacesSelect loading onChange={noop} value={null} />}>
      <AuSuspenseYourDivisionRank />
    </Suspense>
  )
}
