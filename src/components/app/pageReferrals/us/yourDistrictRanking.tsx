'use client'

import {
  createYourLocationRanking,
  YourLocationRankingConfig,
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

const { YourLocationRank, YourLocationRankSuspense } = createYourLocationRanking(config)

export {
  YourLocationRank as UsYourDistrictRank,
  YourLocationRankSuspense as UsYourDistrictRankSuspense,
}
