import { AU_VOTER_GUIDE_CTAS } from '@/components/app/pageVoterGuide/constants/au/auCtas'
import { CA_VOTER_GUIDE_CTAS } from '@/components/app/pageVoterGuide/constants/ca/caCtas'
import { GB_VOTER_GUIDE_CTAS } from '@/components/app/pageVoterGuide/constants/gb/gbCtas'
import { US_VOTER_GUIDE_CTAS } from '@/components/app/pageVoterGuide/constants/us/usCtas'
import { VoterGuideStep } from '@/components/app/pageVoterGuide/types'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

const COUNTRY_VOTER_GUIDE_CTAS: Record<SupportedCountryCodes, VoterGuideStep[]> = {
  [SupportedCountryCodes.US]: US_VOTER_GUIDE_CTAS,
  [SupportedCountryCodes.CA]: CA_VOTER_GUIDE_CTAS,
  [SupportedCountryCodes.GB]: GB_VOTER_GUIDE_CTAS,
  [SupportedCountryCodes.AU]: AU_VOTER_GUIDE_CTAS,
}

export function getVoterGuideCTAsByCountry(countryCode: SupportedCountryCodes) {
  if (countryCode in COUNTRY_VOTER_GUIDE_CTAS) {
    return COUNTRY_VOTER_GUIDE_CTAS[countryCode]
  }

  return gracefullyError({
    msg: `Country config for voter guidenot found for country code: ${countryCode}`,
    fallback: COUNTRY_VOTER_GUIDE_CTAS[DEFAULT_SUPPORTED_COUNTRY_CODE],
    hint: {
      level: 'error',
      tags: {
        domain: 'getVoterGuideCTAsByCountry',
      },
      extra: {
        countryCode,
      },
    },
  })
}
