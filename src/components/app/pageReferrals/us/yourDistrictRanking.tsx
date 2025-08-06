'use client'

import { Suspense } from 'react'
import { noop } from 'lodash-es'

import { DefaultPlacesSelect } from '@/components/app/pageReferrals/common/defaultPlacesSelect'
import { LeaderboardHeading } from '@/components/app/pageReferrals/common/leaderboard/heading'
import { useUserAddress } from '@/components/app/pageReferrals/common/userAddress.context'
import { YourLocale } from '@/components/app/pageReferrals/common/yourLocale'
import { YourLocationRanking } from '@/components/app/pageReferrals/common/yourLocationRanking'
import { GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { getUSStateNameFromStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

function Heading() {
  return (
    <LeaderboardHeading>
      <LeaderboardHeading.Title>Your district</LeaderboardHeading.Title>
      <LeaderboardHeading.Subtitle>Advocates</LeaderboardHeading.Subtitle>
    </LeaderboardHeading>
  )
}

function UsDefaultPlacesSelect(
  props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading' | 'disabled'>,
) {
  return <DefaultPlacesSelect placeholder="Enter your address" title="Your district" {...props} />
}

function DistrictNotFound(props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>) {
  return (
    <YourLocale>
      <UsDefaultPlacesSelect {...props} />
      <YourLocale.Label>District not found, please try a different address.</YourLocale.Label>
    </YourLocale>
  )
}

const countryCode = SupportedCountryCodes.US as const

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
      <UsDefaultPlacesSelect
        loading={isLoading}
        onChange={setAddress}
        value={mutableAddress === 'loading' ? null : mutableAddress}
      />
    )
  }

  if (!isAddressInUS) {
    return (
      <YourLocale>
        <UsDefaultPlacesSelect
          disabled={isAddressFromProfile}
          onChange={setAddress}
          value={isLoading ? null : address}
        />
        <YourLocale.Label>
          Looks like your address is not from the United States, so it can't be used to filter
        </YourLocale.Label>
      </YourLocale>
    )
  }

  if (!district || !stateCode || !district?.zoneName) {
    return <DistrictNotFound onChange={setAddress} value={address} />
  }

  if (!districtRanking) {
    return (
      <DistrictNotFound
        onChange={setAddress}
        value={mutableAddress === 'loading' ? null : address}
      />
    )
  }

  return (
    <YourLocationRanking
      countryCode={countryCode}
      heading={<Heading />}
      label={`${getUSStateNameFromStateCode(stateCode)} - District ${district.zoneName}`}
      locationRanking={districtRanking}
    />
  )
}

export function UsYourDistrictRankSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<UsDefaultPlacesSelect loading onChange={noop} value={null} />}>
      {children}
    </Suspense>
  )
}
