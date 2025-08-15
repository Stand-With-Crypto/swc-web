'use client'

import {
  YourLocationRank,
  YourLocationRanking,
  YourLocationRankingConfig,
  YourLocationRankSuspense,
} from '@/components/app/pageReferrals/common/yourLocationRanking'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const config: YourLocationRankingConfig = {
  countryCode: SupportedCountryCodes.GB,
  placeholder: 'Enter your address',
  title: 'Your constituency',
  notFoundMessage: 'Constituency not found, please try a different address.',
  notFromCountryMessage: `Looks like your address is not from the UK, so it can't be used to filter`,
  formatLabel: (stateName: string, zoneName: string) => `${stateName} - ${zoneName}`,
  getStateName: (regionName: string) => regionName,
}

export function GbYourConstituencyRankingWrapper({ children }: { children: React.ReactNode }) {
  return <YourLocationRanking value={config}>{children}</YourLocationRanking>
}

export function GbYourConstituencyRank() {
  return <YourLocationRank />
}

export function GbYourConstituencyRankSuspense({ children }: { children: React.ReactNode }) {
  return <YourLocationRankSuspense>{children}</YourLocationRankSuspense>
}
