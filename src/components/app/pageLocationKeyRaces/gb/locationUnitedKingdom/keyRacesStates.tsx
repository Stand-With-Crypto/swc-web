import { InternalLink } from '@/components/ui/link'
import {
  GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP,
  GBCountryCode,
} from '@/utils/shared/gbCountryUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface GBKeyRacesStatesProps {
  countryCode: SupportedCountryCodes
}

export function GBKeyRacesStates({ countryCode }: GBKeyRacesStatesProps) {
  const urls = getIntlUrls(countryCode)

  const orderedStateCodes = Object.keys(GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP).sort()

  return orderedStateCodes.map(currentStateCode => {
    const stateCode = currentStateCode as GBCountryCode

    return (
      <InternalLink
        className={cn('mb-4 block flex-shrink-0 font-semibold')}
        href={urls.locationStateSpecificSenateRace(stateCode)}
        key={stateCode}
      >
        {GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP[stateCode]}
      </InternalLink>
    )
  })
}
