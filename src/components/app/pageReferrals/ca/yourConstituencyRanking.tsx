'use client'

import { Suspense } from 'react'
import { isNil, noop } from 'lodash-es'

import { GetDistrictRankResponse } from '@/app/api/public/referrals/[countryCode]/[stateCode]/[districtNumber]/route'
import { LeaderboardRow } from '@/components/app/pageReferrals/leaderboard/row'
import { useUserAddress } from '@/components/app/pageReferrals/userAddress.context'
import { GooglePlacesSelect, GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { Skeleton } from '@/components/ui/skeleton'
import { StateCode } from '@/utils/server/districtRankings/types'
import { getCAProvinceOrTerritoryNameFromCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { GooglePlaceAutocompletePrediction } from '@/utils/web/googlePlaceUtils'

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
  constituencyRanking: GetDistrictRankResponse | null
  address: 'loading' | GooglePlaceAutocompletePrediction | null
  setAddress: (p: GooglePlaceAutocompletePrediction | null) => void
  isLoading: boolean
}

const countryCode = SupportedCountryCodes.CA

function CaYourConstituencyRankContent(props: CaYourConstituencyRankContentProps) {
  const { provinceCode, constituency, constituencyRanking, isLoading, address, setAddress } = props

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Heading />
        <Skeleton className="h-12 w-full bg-primary-cta/10" />
      </div>
    )
  }

  if (!constituencyRanking) {
    return (
      <ConstituencyNotFound onChange={setAddress} value={address === 'loading' ? null : address} />
    )
  }

  const count = constituencyRanking.score
  const rank = constituencyRanking.rank

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

export function CaSuspenseYourConstituencyRank() {
  const {
    address,
    setMutableAddress: setAddress,
    mutableAddress,
    isAddressInCountry: isAddressInCanada,
    isLoading,
    electoralZone: constituency,
    electoralZoneRanking,
    administrativeArea: provinceCode,
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

  if (!isAddressInCanada) {
    return (
      <div className="space-y-3">
        <DefaultPlacesSelect onChange={setAddress} value={isLoading ? null : address} />
        <p className="pl-4 text-sm text-fontcolor-muted">
          Looks like your address is not from Canada, so it can't be used to filter
        </p>
      </div>
    )
  }

  if (!constituency) {
    return <ConstituencyNotFound onChange={setAddress} value={address} />
  }

  if (!provinceCode || !constituency?.zoneName) {
    return <ConstituencyNotFound onChange={setAddress} value={address} />
  }

  return (
    <CaYourConstituencyRankContent
      address={mutableAddress}
      constituency={constituency.zoneName}
      constituencyRanking={electoralZoneRanking}
      isLoading={isLoading}
      provinceCode={provinceCode}
      setAddress={setAddress}
    />
  )
}

export function CaYourConstituencyRank() {
  return (
    <Suspense fallback={<DefaultPlacesSelect loading onChange={noop} value={null} />}>
      <CaSuspenseYourConstituencyRank />
    </Suspense>
  )
}
