'use client'

import { Suspense } from 'react'
import { isNil, noop } from 'lodash-es'

import { GetDistrictRankResponse } from '@/app/api/public/referrals/[countryCode]/[stateCode]/[districtNumber]/route'
import {
  DefaultPlacesSelect,
  DefaultPlacesSelectProps,
} from '@/components/app/pageReferrals/common/defaultPlacesSelect'
import { LeaderboardHeading } from '@/components/app/pageReferrals/common/leaderboard/heading'
import { LeaderboardRow } from '@/components/app/pageReferrals/common/leaderboard/row'
import { useUserAddress } from '@/components/app/pageReferrals/common/userAddress.context'
import { YourLocale } from '@/components/app/pageReferrals/common/yourLocale'
import { GooglePlacesSelectProps } from '@/components/ui/googlePlacesSelect'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'

// Display component (original)
interface YourLocationRankingProps {
  locationRanking: GetDistrictRankResponse | null
  countryCode: SupportedCountryCodes
  heading: React.ReactNode
  label: string
}

export function YourLocationRanking(props: YourLocationRankingProps) {
  const { locationRanking, countryCode, heading, label } = props

  const count = locationRanking?.score
  const rank = locationRanking?.rank

  if (isNil(count) || isNil(rank)) {
    return null
  }

  return (
    <YourLocale>
      {heading}
      <LeaderboardRow
        count={count}
        locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
        rank={rank}
        variant="highlight"
      >
        <LeaderboardRow.Label>{label}</LeaderboardRow.Label>
      </LeaderboardRow>
    </YourLocale>
  )
}

export interface YourLocationRankingConfig {
  countryCode: SupportedCountryCodes
  placeholder: string
  title: string
  notFoundMessage: string
  notFromCountryMessage: string
  formatLabel: (stateName: string, zoneName: string) => string
  getStateName: (stateCode: string) => string
}

export function createYourLocationRanking(config: YourLocationRankingConfig) {
  function Heading() {
    return (
      <LeaderboardHeading>
        <LeaderboardHeading.Title>{config.title}</LeaderboardHeading.Title>
        <LeaderboardHeading.Subtitle>Advocates</LeaderboardHeading.Subtitle>
      </LeaderboardHeading>
    )
  }

  function DefaultPlacesSelectWrapper(
    props: Omit<DefaultPlacesSelectProps, 'title' | 'placeholder'>,
  ) {
    return <DefaultPlacesSelect placeholder={config.placeholder} title={config.title} {...props} />
  }

  function LocationNotFound(
    props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>,
  ) {
    return (
      <YourLocale>
        <DefaultPlacesSelectWrapper {...props} />
        <YourLocale.Label>{config.notFoundMessage}</YourLocale.Label>
      </YourLocale>
    )
  }

  function YourLocationRank() {
    const {
      address,
      setMutableAddress: setAddress,
      mutableAddress,
      isAddressInCountry,
      isLoading,
      electoralZone,
      electoralZoneRanking,
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
        <DefaultPlacesSelectWrapper
          loading={isLoading}
          onChange={setAddress}
          value={mutableAddress === 'loading' ? null : mutableAddress}
        />
      )
    }

    if (!isAddressInCountry) {
      return (
        <YourLocale>
          <DefaultPlacesSelectWrapper
            disabled={isAddressFromProfile}
            onChange={setAddress}
            value={isLoading ? null : address}
          />
          <YourLocale.Label>{config.notFromCountryMessage}</YourLocale.Label>
        </YourLocale>
      )
    }

    if (!electoralZone || !stateCode || !electoralZone?.zoneName) {
      return <LocationNotFound onChange={setAddress} value={address} />
    }

    if (!electoralZoneRanking) {
      return (
        <LocationNotFound
          onChange={setAddress}
          value={mutableAddress === 'loading' ? null : address}
        />
      )
    }

    return (
      <YourLocationRanking
        countryCode={config.countryCode}
        heading={<Heading />}
        label={config.formatLabel(config.getStateName(stateCode), electoralZone.zoneName)}
        locationRanking={electoralZoneRanking}
      />
    )
  }

  function YourLocationRankSuspense({ children }: { children: React.ReactNode }) {
    return (
      <Suspense fallback={<DefaultPlacesSelectWrapper loading onChange={noop} value={null} />}>
        {children}
      </Suspense>
    )
  }

  return {
    YourLocationRank,
    YourLocationRankSuspense,
  }
}
