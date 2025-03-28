import { InternalLink } from '@/components/ui/link'
import {
  AU_STATE_CODE_TO_DISPLAY_NAME_MAP,
  AUStateCode,
} from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface AUKeyRacesStatesProps {
  countryCode: SupportedCountryCodes
}

export function AUKeyRacesStates({ countryCode }: AUKeyRacesStatesProps) {
  const urls = getIntlUrls(countryCode)

  const orderedStateCodes = Object.keys(AU_STATE_CODE_TO_DISPLAY_NAME_MAP).sort()

  return orderedStateCodes.map(currentStateCode => {
    const stateCode = currentStateCode as AUStateCode

    return (
      <InternalLink
        className={cn('mb-4 block flex-shrink-0 font-semibold')}
        href={urls.locationStateSpecific(stateCode)}
        key={stateCode}
      >
        {AU_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]}
      </InternalLink>
    )
  })
}
