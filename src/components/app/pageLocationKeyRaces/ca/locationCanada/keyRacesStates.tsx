import { InternalLink } from '@/components/ui/link'
import {
  CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  CAProvinceOrTerritoryCode,
} from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface CAKeyRacesStatesProps {
  countryCode: SupportedCountryCodes
}

export function CAKeyRacesStates({ countryCode }: CAKeyRacesStatesProps) {
  const urls = getIntlUrls(countryCode)

  const orderedStateCodes = Object.keys(
    CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  ).sort()

  return orderedStateCodes.map(currentStateCode => {
    const stateCode = currentStateCode as CAProvinceOrTerritoryCode

    return (
      <InternalLink
        className={cn('mb-4 block flex-shrink-0 font-semibold')}
        href={urls.locationStateSpecific(stateCode)}
        key={stateCode}
      >
        {CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP[stateCode]}
      </InternalLink>
    )
  })
}
