'use client'

import { Suspense } from 'react'
import { noop } from 'lodash-es'

import { useUserAddress } from '@/components/app/pageReferrals/common/userAddress.context'
import { GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { getCAProvinceOrTerritoryNameFromCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { DefaultPlacesSelect } from '@/components/app/pageReferrals/common/defaultPlacesSelect'
import { YourLocale } from '@/components/app/pageReferrals/common/yourLocale'
import { LeaderboardHeading } from '@/components/app/pageReferrals/common/leaderboard/heading'
import { YourLocationRanking } from '@/components/app/pageReferrals/common/yourLocationRanking'

function Heading() {
  return (
    <LeaderboardHeading>
      <LeaderboardHeading.Title>Your constituency</LeaderboardHeading.Title>
      <LeaderboardHeading.Subtitle>Advocates</LeaderboardHeading.Subtitle>
    </LeaderboardHeading>
  )
}

function CaDefaultPlacesSelect(
  props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>,
) {
  return (
    <DefaultPlacesSelect title="Your constituency" placeholder="Enter your address" {...props} />
  )
}

function ConstituencyNotFound(
  props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>,
) {
  return (
    <YourLocale>
      <CaDefaultPlacesSelect {...props} />
      <YourLocale.Label>Constituency not found, please try a different address.</YourLocale.Label>
    </YourLocale>
  )
}

const countryCode = SupportedCountryCodes.CA as const

export function CaYourConstituencyRank() {
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
      <YourLocale>
        <Heading />
        <DefaultPlacesSelect.Loading />
      </YourLocale>
    )
  }

  if (!address) {
    return (
      <CaDefaultPlacesSelect
        loading={isLoading}
        onChange={setAddress}
        value={mutableAddress === 'loading' ? null : mutableAddress}
      />
    )
  }

  if (!isAddressInCanada) {
    return (
      <YourLocale>
        <CaDefaultPlacesSelect onChange={setAddress} value={isLoading ? null : address} />
        <YourLocale.Label>
          Looks like your address is not from Canada, so it can't be used to filter
        </YourLocale.Label>
      </YourLocale>
    )
  }

  if (!constituency || !constituency?.zoneName || !provinceCode) {
    return <ConstituencyNotFound onChange={setAddress} value={address} />
  }

  if (!electoralZoneRanking) {
    return (
      <ConstituencyNotFound
        onChange={setAddress}
        value={mutableAddress === 'loading' ? null : address}
      />
    )
  }

  return (
    <YourLocationRanking
      locationRanking={electoralZoneRanking}
      countryCode={countryCode}
      heading={<Heading />}
      label={`${getCAProvinceOrTerritoryNameFromCode(provinceCode)} - ${constituency.zoneName}`}
    />
  )
}

export function CaYourConstituencyRankSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<CaDefaultPlacesSelect loading onChange={noop} value={null} />}>
      {children}
    </Suspense>
  )
}
