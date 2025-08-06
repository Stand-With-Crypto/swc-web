'use client'

import { Suspense } from 'react'
import { noop } from 'lodash-es'

import {
  DefaultPlacesSelect,
  DefaultPlacesSelectProps,
} from '@/components/app/pageReferrals/common/defaultPlacesSelect'
import { LeaderboardHeading } from '@/components/app/pageReferrals/common/leaderboard/heading'
import { useUserAddress } from '@/components/app/pageReferrals/common/userAddress.context'
import { YourLocale } from '@/components/app/pageReferrals/common/yourLocale'
import { YourLocationRanking } from '@/components/app/pageReferrals/common/yourLocationRanking'
import { GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { getCAProvinceOrTerritoryNameFromCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

function Heading() {
  return (
    <LeaderboardHeading>
      <LeaderboardHeading.Title>Your constituency</LeaderboardHeading.Title>
      <LeaderboardHeading.Subtitle>Advocates</LeaderboardHeading.Subtitle>
    </LeaderboardHeading>
  )
}

function CaDefaultPlacesSelect(props: Omit<DefaultPlacesSelectProps, 'title' | 'placeholder'>) {
  return (
    <DefaultPlacesSelect placeholder="Enter your address" title="Your constituency" {...props} />
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
    isAddressFromProfile,
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
        <CaDefaultPlacesSelect
          disabled={isAddressFromProfile}
          onChange={setAddress}
          value={isLoading ? null : address}
        />
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
      countryCode={countryCode}
      heading={<Heading />}
      label={`${getCAProvinceOrTerritoryNameFromCode(provinceCode)} - ${constituency.zoneName}`}
      locationRanking={electoralZoneRanking}
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
