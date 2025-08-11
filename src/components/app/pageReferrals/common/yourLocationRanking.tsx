'use client'

import { createContext, Suspense, useContext } from 'react'
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

export function YourLocationRankingDisplay(props: YourLocationRankingProps) {
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

const YourDistrictRankingContext = createContext<YourLocationRankingConfig>(
  {} as YourLocationRankingConfig,
)

export function YourLocationRanking({
  children,
  value,
}: {
  children: React.ReactNode
  value: YourLocationRankingConfig
}) {
  return (
    <YourDistrictRankingContext.Provider value={value}>
      {children}
    </YourDistrictRankingContext.Provider>
  )
}

export function useYourDistrictRanking() {
  const context = useContext(YourDistrictRankingContext)
  if (context === undefined) {
    throw new Error('useYourDistrictRanking must be used within a YourDistrictRankingProvider')
  }
  return context
}

export function YourDistrictRankingHeader() {
  const config = useYourDistrictRanking()

  return (
    <LeaderboardHeading>
      <LeaderboardHeading.Title>{config.title}</LeaderboardHeading.Title>
      <LeaderboardHeading.Subtitle>Advocates</LeaderboardHeading.Subtitle>
    </LeaderboardHeading>
  )
}

export function YourDistrictRankingLabel() {
  const config = useYourDistrictRanking()
  const { electoralZone, administrativeArea: stateCode } = useUserAddress()

  if (!electoralZone || !stateCode) {
    return null
  }

  return (
    <LeaderboardRow.Label>
      {config.formatLabel(config.getStateName(stateCode), electoralZone.zoneName)}
    </LeaderboardRow.Label>
  )
}

function LocationNotFound(props: Pick<GooglePlacesSelectProps, 'onChange' | 'value' | 'loading'>) {
  const config = useYourDistrictRanking()

  return (
    <YourLocale>
      <YourDistrictRankingDefaultPlacesSelectWrapper {...props} />
      <YourLocale.Label>{config.notFoundMessage}</YourLocale.Label>
    </YourLocale>
  )
}

export function YourDistrictRankingDefaultPlacesSelectWrapper(
  props: Omit<DefaultPlacesSelectProps, 'title' | 'placeholder'>,
) {
  const config = useYourDistrictRanking()
  return <DefaultPlacesSelect placeholder={config.placeholder} title={config.title} {...props} />
}

export function YourLocationRank() {
  const config = useYourDistrictRanking()
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
        <YourDistrictRankingHeader />
        <DefaultPlacesSelect.Loading />
      </YourLocale>
    )
  }

  if (!address) {
    return (
      <YourDistrictRankingDefaultPlacesSelectWrapper
        loading={isLoading}
        onChange={setAddress}
        value={mutableAddress === 'loading' ? null : mutableAddress}
      />
    )
  }

  if (!isAddressInCountry) {
    return (
      <YourLocale>
        <YourDistrictRankingDefaultPlacesSelectWrapper
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
    <YourLocationRankingDisplay
      countryCode={config.countryCode}
      heading={<YourDistrictRankingHeader />}
      label={config.formatLabel(config.getStateName(stateCode), electoralZone.zoneName)}
      locationRanking={electoralZoneRanking}
    />
  )
}

export function YourLocationRankSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <YourDistrictRankingDefaultPlacesSelectWrapper loading onChange={noop} value={null} />
      }
    >
      {children}
    </Suspense>
  )
}
