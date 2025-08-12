'use client'

import {
  YourLocationRank,
  YourLocationRanking,
  YourLocationRankingConfig,
  YourLocationRankSuspense,
} from '@/components/app/pageReferrals/common/yourLocationRanking'
import { getAUStateNameFromStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const config: YourLocationRankingConfig = {
  countryCode: SupportedCountryCodes.AU,
  placeholder: 'Enter your address',
  title: 'Your division',
  notFoundMessage: 'Division not found, please try a different address.',
  notFromCountryMessage: `Looks like your address is not from Australia, so it can't be used to filter`,
  formatLabel: (stateName: string, zoneName: string) => `${stateName} - ${zoneName}`,
  getStateName: getAUStateNameFromStateCode,
}

export function AuYourDivisionRankingWrapper({ children }: { children: React.ReactNode }) {
  return <YourLocationRanking value={config}>{children}</YourLocationRanking>
}

export function AuYourDivisionRank() {
  return <YourLocationRank />
}

export function AuYourDivisionRankSuspense({ children }: { children: React.ReactNode }) {
  return <YourLocationRankSuspense>{children}</YourLocationRankSuspense>
}
