'use client'

import {
  createYourLocationRanking,
  YourLocationRankingConfig,
} from '@/components/app/pageReferrals/common/yourLocationRanking'
import { getCAProvinceOrTerritoryNameFromCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const config: YourLocationRankingConfig = {
  countryCode: SupportedCountryCodes.CA,
  placeholder: 'Enter your address',
  title: 'Your constituency',
  notFoundMessage: 'Constituency not found, please try a different address.',
  notFromCountryMessage: `Looks like your address is not from Canada, so it can't be used to filter`,
  formatLabel: (stateName: string, zoneName: string) => `${stateName} - ${zoneName}`,
  getStateName: getCAProvinceOrTerritoryNameFromCode,
}

const { YourLocationRank, YourLocationRankSuspense } = createYourLocationRanking(config)

export {
  YourLocationRank as CaYourConstituencyRank,
  YourLocationRankSuspense as CaYourConstituencyRankSuspense,
}
