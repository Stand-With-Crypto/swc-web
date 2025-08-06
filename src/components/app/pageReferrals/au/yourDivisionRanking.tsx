'use client'

import { Suspense } from 'react'
import { noop } from 'lodash-es'

import { DefaultPlacesSelect } from '@/components/app/pageReferrals/common/defaultPlacesSelect'
import { LeaderboardHeading } from '@/components/app/pageReferrals/common/leaderboard/heading'
import { useUserAddress } from '@/components/app/pageReferrals/common/userAddress.context'
import { YourLocale } from '@/components/app/pageReferrals/common/yourLocale'
import { YourLocationRanking } from '@/components/app/pageReferrals/common/yourLocationRanking'
import { GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { getAUStateNameFromStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

function Heading() {
  return (
    <LeaderboardHeading>
      <LeaderboardHeading.Title>Your division</LeaderboardHeading.Title>
      <LeaderboardHeading.Subtitle>Advocates</LeaderboardHeading.Subtitle>
    </LeaderboardHeading>
  )
}

function AuDefaultPlacesSelect(
  props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading' | 'disabled'>,
) {
  return <DefaultPlacesSelect placeholder="Enter your address" title="Your division" {...props} />
}

function DivisionNotFound(props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>) {
  return (
    <YourLocale>
      <AuDefaultPlacesSelect {...props} />
      <YourLocale.Label>Division not found, please try a different address.</YourLocale.Label>
    </YourLocale>
  )
}

const countryCode = SupportedCountryCodes.AU

export function AuYourDivisionRank() {
  const {
    address,
    setMutableAddress: setAddress,
    mutableAddress,
    isAddressInCountry: isAddressInAustralia,
    isLoading,
    electoralZone: division,
    electoralZoneRanking: divisionRanking,
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
      <AuDefaultPlacesSelect
        loading={isLoading}
        onChange={setAddress}
        value={mutableAddress === 'loading' ? null : mutableAddress}
      />
    )
  }

  if (!isAddressInAustralia) {
    return (
      <YourLocale>
        <AuDefaultPlacesSelect
          disabled={isAddressFromProfile}
          onChange={setAddress}
          value={isLoading ? null : address}
        />
        <YourLocale.Label>
          Looks like your address is not from Australia, so it can't be used to filter
        </YourLocale.Label>
      </YourLocale>
    )
  }

  if (!division || !stateCode || !division?.zoneName) {
    return <DivisionNotFound onChange={setAddress} value={address} />
  }

  if (!divisionRanking) {
    return (
      <DivisionNotFound
        onChange={setAddress}
        value={mutableAddress === 'loading' ? null : address}
      />
    )
  }

  return (
    <YourLocationRanking
      countryCode={countryCode}
      heading={<Heading />}
      label={`${getAUStateNameFromStateCode(stateCode)} - ${division.zoneName}`}
      locationRanking={divisionRanking}
    />
  )
}

export function AuYourDivisionRankSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AuDefaultPlacesSelect loading onChange={noop} value={null} />}>
      {children}
    </Suspense>
  )
}
