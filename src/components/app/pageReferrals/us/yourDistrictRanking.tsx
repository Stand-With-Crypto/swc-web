'use client'

import {
  YourLocationRank,
  YourLocationRanking,
  YourLocationRankingConfig,
  YourLocationRankSuspense,
} from '@/components/app/pageReferrals/common/yourLocationRanking'
import { getUSStateNameFromStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const config: YourLocationRankingConfig = {
  countryCode: SupportedCountryCodes.US,
  placeholder: 'Enter your address',
  title: 'Your district',
  notFoundMessage: 'District not found, please try a different address.',
  notFromCountryMessage: `Looks like your address is not from the United States, so it can't be used to filter`,
  formatLabel: (stateName: string, zoneName: string) => `${stateName} - District ${zoneName}`,
  getStateName: getUSStateNameFromStateCode,
}

export function UsYourDistrictRankingWrapper({ children }: { children: React.ReactNode }) {
  return <YourLocationRanking value={config}>{children}</YourLocationRanking>
}

export function UsYourDistrictRank() {
  return <YourLocationRank />
}

export function UsYourDistrictRankSuspense({ children }: { children: React.ReactNode }) {
  return <YourLocationRankSuspense>{children}</YourLocationRankSuspense>
}
